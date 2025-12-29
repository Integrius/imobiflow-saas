/**
 * Rotas de gerenciamento de usuários
 *
 * Apenas ADMIN e GESTOR podem acessar (com permissões diferentes)
 */

import { FastifyInstance } from 'fastify';
import { prisma } from '../../shared/database/prisma.service';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { requireAdmin, requireManager, Permissions } from '../../shared/middlewares/permissions.middleware';
import bcrypt from 'bcryptjs';

interface CreateUserBody {
  nome: string;
  email: string;
  senha: string;
  tipo: 'ADMIN' | 'GESTOR' | 'CORRETOR';
  creci?: string;
  telefone?: string;
}

interface UpdateUserBody {
  nome?: string;
  email?: string;
  senha?: string;
  ativo?: boolean;
  tipo?: 'ADMIN' | 'GESTOR' | 'CORRETOR';
}

export async function usersRoutes(server: FastifyInstance) {
  /**
   * GET /api/v1/users
   * Lista todos os usuários do tenant
   *
   * Permissões:
   * - ADMIN: pode ver todos os usuários
   * - GESTOR: pode ver todos os usuários
   * - CORRETOR: não tem acesso
   */
  server.get('/', {
    preHandler: [authMiddleware, requireManager]
  }, async (request, reply) => {
    try {
      const user = request.user!;

      const users = await prisma.user.findMany({
        where: {
          tenant_id: user.tenant_id
        },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          ativo: true,
          created_at: true,
          ultimo_login: true,
          corretor: {
            select: {
              id: true,
              creci: true,
              telefone: true,
              especializacoes: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      const usersCount = await prisma.user.count({
        where: { tenant_id: user.tenant_id }
      });

      return {
        success: true,
        total: usersCount,
        users: users.map(u => ({
          ...u,
          corretor: u.corretor || undefined
        }))
      };
    } catch (error: any) {
      server.log.error('Erro ao listar usuários:', error);
      return reply.status(500).send({
        error: 'Erro ao listar usuários',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/users/:id
   * Busca usuário por ID
   *
   * Permissões:
   * - ADMIN: pode ver qualquer usuário
   * - GESTOR: pode ver qualquer usuário
   * - CORRETOR: pode ver apenas seus próprios dados (via /auth/me)
   */
  server.get<{ Params: { id: string } }>('/:id', {
    preHandler: [authMiddleware, requireManager]
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const currentUser = request.user!;

      const user = await prisma.user.findFirst({
        where: {
          id,
          tenant_id: currentUser.tenant_id
        },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          ativo: true,
          created_at: true,
          updated_at: true,
          ultimo_login: true,
          corretor: {
            select: {
              id: true,
              creci: true,
              telefone: true,
              foto_url: true,
              especializacoes: true,
              meta_mensal: true,
              meta_anual: true,
              comissao_padrao: true,
              performance_score: true
            }
          }
        }
      });

      if (!user) {
        return reply.status(404).send({
          error: 'Usuário não encontrado'
        });
      }

      return {
        success: true,
        user
      };
    } catch (error: any) {
      server.log.error('Erro ao buscar usuário:', error);
      return reply.status(500).send({
        error: 'Erro ao buscar usuário',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/users
   * Cria novo usuário
   *
   * Permissões:
   * - ADMIN: pode criar ADMIN, GESTOR ou CORRETOR
   * - GESTOR: pode criar apenas CORRETOR
   */
  server.post<{ Body: CreateUserBody }>('/', {
    preHandler: [authMiddleware, requireManager]
  }, async (request, reply) => {
    try {
      const currentUser = request.user!;
      const { nome, email, senha, tipo, creci, telefone } = request.body;

      // Validar campos obrigatórios
      if (!nome || !email || !senha || !tipo) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          message: 'Nome, email, senha e tipo são obrigatórios'
        });
      }

      // Verificar permissão para criar este tipo de usuário
      if (!Permissions.canCreateUser(currentUser.tipo as any, tipo)) {
        return reply.status(403).send({
          error: 'Permissão negada',
          message: `Você não tem permissão para criar usuário do tipo ${tipo}`
        });
      }

      // Verificar se email já existe no tenant
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          tenant_id: currentUser.tenant_id
        }
      });

      if (emailExists) {
        return reply.status(400).send({
          error: 'Email já cadastrado',
          message: 'Este email já está sendo usado por outro usuário'
        });
      }

      // Hash da senha
      const senha_hash = await bcrypt.hash(senha, 10);

      // Criar usuário
      const newUser = await prisma.user.create({
        data: {
          tenant_id: currentUser.tenant_id,
          nome,
          email,
          senha_hash,
          tipo,
          ativo: true
        },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          ativo: true,
          created_at: true
        }
      });

      // Se for CORRETOR, criar registro de corretor
      if (tipo === 'CORRETOR' && telefone) {
        await prisma.corretor.create({
          data: {
            tenant_id: currentUser.tenant_id,
            user_id: newUser.id,
            creci: creci || '',
            telefone,
            especializacoes: [],
            comissao_padrao: 3.0
          }
        });
      }

      // Atualizar contador de usuários do tenant
      await prisma.tenant.update({
        where: { id: currentUser.tenant_id },
        data: {
          total_usuarios: {
            increment: 1
          }
        }
      });

      server.log.info(`Usuário criado: ${newUser.email} (${newUser.tipo}) por ${currentUser.email}`);

      return reply.status(201).send({
        success: true,
        message: 'Usuário criado com sucesso',
        user: newUser
      });
    } catch (error: any) {
      server.log.error('Erro ao criar usuário:', error);
      return reply.status(500).send({
        error: 'Erro ao criar usuário',
        message: error.message
      });
    }
  });

  /**
   * PATCH /api/v1/users/:id
   * Atualiza usuário
   *
   * Permissões:
   * - ADMIN: pode editar qualquer usuário
   * - GESTOR: pode editar apenas CORRETORES
   */
  server.patch<{
    Params: { id: string };
    Body: UpdateUserBody;
  }>('/:id', {
    preHandler: [authMiddleware, requireManager]
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const currentUser = request.user!;
      const { nome, email, senha, ativo, tipo } = request.body;

      // Buscar usuário a ser editado
      const targetUser = await prisma.user.findFirst({
        where: {
          id,
          tenant_id: currentUser.tenant_id
        }
      });

      if (!targetUser) {
        return reply.status(404).send({
          error: 'Usuário não encontrado'
        });
      }

      // Verificar permissão para editar este usuário
      if (!Permissions.canEditUser(currentUser.tipo as any, targetUser.tipo as any)) {
        return reply.status(403).send({
          error: 'Permissão negada',
          message: `Você não tem permissão para editar usuário do tipo ${targetUser.tipo}`
        });
      }

      // Preparar dados para atualização
      const updateData: any = {};

      if (nome !== undefined) updateData.nome = nome;
      if (email !== undefined) {
        // Verificar se novo email já existe
        const emailExists = await prisma.user.findFirst({
          where: {
            email,
            tenant_id: currentUser.tenant_id,
            NOT: { id }
          }
        });

        if (emailExists) {
          return reply.status(400).send({
            error: 'Email já cadastrado'
          });
        }

        updateData.email = email;
      }

      if (senha !== undefined) {
        updateData.senha_hash = await bcrypt.hash(senha, 10);
      }

      if (ativo !== undefined) updateData.ativo = ativo;

      // Apenas ADMIN pode alterar tipo de usuário
      if (tipo !== undefined) {
        if (currentUser.tipo !== 'ADMIN') {
          return reply.status(403).send({
            error: 'Apenas ADMIN pode alterar tipo de usuário'
          });
        }
        updateData.tipo = tipo;
      }

      // Atualizar usuário
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          ativo: true,
          updated_at: true
        }
      });

      server.log.info(`Usuário atualizado: ${updatedUser.email} por ${currentUser.email}`);

      return {
        success: true,
        message: 'Usuário atualizado com sucesso',
        user: updatedUser
      };
    } catch (error: any) {
      server.log.error('Erro ao atualizar usuário:', error);
      return reply.status(500).send({
        error: 'Erro ao atualizar usuário',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/v1/users/:id
   * Deleta usuário (soft delete - apenas desativa)
   *
   * Permissões:
   * - Apenas ADMIN pode deletar usuários
   */
  server.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [authMiddleware, requireAdmin]
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const currentUser = request.user!;

      // Não permitir deletar a si mesmo
      if (id === currentUser.id) {
        return reply.status(400).send({
          error: 'Não é possível deletar seu próprio usuário'
        });
      }

      // Verificar se usuário existe no tenant
      const user = await prisma.user.findFirst({
        where: {
          id,
          tenant_id: currentUser.tenant_id
        }
      });

      if (!user) {
        return reply.status(404).send({
          error: 'Usuário não encontrado'
        });
      }

      // Soft delete - apenas desativar
      await prisma.user.update({
        where: { id },
        data: { ativo: false }
      });

      // Decrementar contador de usuários
      await prisma.tenant.update({
        where: { id: currentUser.tenant_id },
        data: {
          total_usuarios: {
            decrement: 1
          }
        }
      });

      server.log.info(`Usuário desativado: ${user.email} por ${currentUser.email}`);

      return {
        success: true,
        message: 'Usuário desativado com sucesso'
      };
    } catch (error: any) {
      server.log.error('Erro ao deletar usuário:', error);
      return reply.status(500).send({
        error: 'Erro ao deletar usuário',
        message: error.message
      });
    }
  });
}
