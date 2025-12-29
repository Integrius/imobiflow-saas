/**
 * Rotas de setup inicial do sistema
 *
 * IMPORTANTE: Estas rotas devem ser REMOVIDAS ou PROTEGIDAS em produção!
 */

import { FastifyInstance } from 'fastify';
import { prisma } from '../../shared/database/prisma.service';
import bcrypt from 'bcryptjs';

export async function setupRoutes(server: FastifyInstance) {
  /**
   * POST /api/v1/setup/tenant-admin
   *
   * Cria tenant Vivoly e usuário ADMIN inicial
   *
   * ATENÇÃO: Esta rota é para setup inicial apenas!
   */
  server.post('/tenant-admin', async (request, reply) => {
    try {
      server.log.info('🚀 Iniciando criação de tenant e admin...');

      // Verificar se já existe tenant
      const existingTenant = await prisma.tenant.findUnique({
        where: { slug: 'vivoly' }
      });

      if (existingTenant) {
        return reply.status(400).send({
          error: 'Tenant já existe',
          message: 'O tenant Vivoly já foi criado',
          tenant: {
            id: existingTenant.id,
            nome: existingTenant.nome,
            subdominio: existingTenant.subdominio
          }
        });
      }

      // Criar tenant
      const tenant = await prisma.tenant.create({
        data: {
          nome: 'Vivoly Imobiliária',
          slug: 'vivoly',
          subdominio: 'vivoly',
          email: 'contato@vivoly.com.br',
          telefone: '11999999999',
          plano: 'PRO',
          status: 'ATIVO',
          limite_usuarios: 10,
          limite_imoveis: 500,
          total_usuarios: 1,
          total_imoveis: 0
        }
      });

      server.log.info(`✅ Tenant criado: ${tenant.nome}`);

      // Criar usuário ADMIN
      const senhaHash = await bcrypt.hash('admin123', 10);

      const admin = await prisma.user.create({
        data: {
          tenant_id: tenant.id,
          nome: 'Administrador Vivoly',
          email: 'admin@vivoly.com',
          senha_hash: senhaHash,
          tipo: 'ADMIN',
          ativo: true
        }
      });

      server.log.info(`✅ ADMIN criado: ${admin.email}`);

      return {
        success: true,
        message: 'Tenant e ADMIN criados com sucesso!',
        tenant: {
          id: tenant.id,
          nome: tenant.nome,
          slug: tenant.slug,
          subdominio: tenant.subdominio,
          email: tenant.email,
          plano: tenant.plano,
          status: tenant.status
        },
        admin: {
          id: admin.id,
          nome: admin.nome,
          email: admin.email,
          tipo: admin.tipo
        },
        credentials: {
          email: 'admin@vivoly.com',
          senha: 'admin123'
        },
        access: {
          url_producao: 'https://vivoly.integrius.com.br',
          url_dev: 'http://localhost:3000',
          api_login: 'POST /api/v1/auth/login'
        },
        next_steps: [
          'Fazer login com as credenciais fornecidas',
          'Criar usuários GESTORES via POST /api/v1/users',
          'Criar usuários CORRETORES via POST /api/v1/users',
          'Configurar DNS wildcard no Cloudflare (*.integrius.com.br)'
        ]
      };

    } catch (error: any) {
      server.log.error('Erro ao criar tenant e admin:', error);
      return reply.status(500).send({
        error: 'Erro ao criar tenant e admin',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/setup/check
   *
   * Verifica se o setup já foi feito
   */
  server.get('/check', async (request, reply) => {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { slug: 'vivoly' }
      });

      if (!tenant) {
        return {
          setup_complete: false,
          message: 'Nenhum tenant configurado. Execute POST /api/v1/setup/tenant-admin'
        };
      }

      const adminCount = await prisma.user.count({
        where: {
          tenant_id: tenant.id,
          tipo: 'ADMIN',
          ativo: true
        }
      });

      return {
        setup_complete: true,
        tenant: {
          id: tenant.id,
          nome: tenant.nome,
          subdominio: tenant.subdominio,
          status: tenant.status
        },
        admin_users: adminCount,
        total_users: await prisma.user.count({ where: { tenant_id: tenant.id, ativo: true } }),
        total_imoveis: tenant.total_imoveis
      };

    } catch (error: any) {
      server.log.error('Erro ao verificar setup:', error);
      return reply.status(500).send({
        error: 'Erro ao verificar setup',
        message: error.message
      });
    }
  });
}
