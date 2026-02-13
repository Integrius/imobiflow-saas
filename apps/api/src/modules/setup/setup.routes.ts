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
   * POST /api/v1/setup/tenant-admin-raw
   *
   * Cria tenant Vivoly e usuário ADMIN usando SQL raw
   * Usa SQL direto para bypasser problemas de permissões do Prisma
   *
   * ATENÇÃO: Esta rota é para setup inicial apenas!
   */
  server.post('/tenant-admin-raw', async (request, reply) => {
    try {
      server.log.info('🚀 Iniciando criação de tenant e admin (SQL raw)...');

      // 1. Testar conexão
      server.log.info('📡 Testando conexão com banco...');
      await prisma.$executeRaw`SELECT 1`;
      server.log.info('✅ Conexão OK');

      // 2. Verificar se tenant já existe
      server.log.info('🔍 Verificando se tenant Vivoly já existe...');
      const existingTenant = await prisma.$queryRaw<any[]>`
        SELECT id, nome, subdominio FROM "Tenant" WHERE slug = 'vivoly' LIMIT 1
      `;

      let tenantId: string;

      if (existingTenant.length > 0) {
        server.log.info('⚠️  Tenant Vivoly já existe!');
        tenantId = existingTenant[0].id;
      } else {
        // 3. Criar tenant usando SQL raw
        server.log.info('📦 Criando tenant Vivoly...');
        const newTenant = await prisma.$queryRaw<any[]>`
          INSERT INTO "Tenant" (
            id, nome, slug, subdominio, email, telefone,
            plano, status, limite_usuarios, limite_imoveis,
            total_usuarios, total_imoveis, created_at, updated_at
          ) VALUES (
            gen_random_uuid(),
            'Vivoly Imobiliária',
            'vivoly',
            'vivoly',
            'contato@vivoly.com.br',
            '11999999999',
            'PRO',
            'ATIVO',
            10,
            500,
            1,
            0,
            NOW(),
            NOW()
          )
          RETURNING id, nome, subdominio
        ` as any[];

        tenantId = newTenant[0].id;
        server.log.info(`✅ Tenant criado! ID: ${tenantId}`);
      }

      // 4. Verificar se admin já existe
      server.log.info('🔍 Verificando se admin já existe...');
      const existingAdmin = await prisma.$queryRaw<any[]>`
        SELECT id, email FROM "User"
        WHERE tenant_id = ${tenantId}::uuid
        AND email = 'admin@vivoly.com'
        LIMIT 1
      `;

      let adminCreated = false;

      if (existingAdmin.length > 0) {
        server.log.info('⚠️  Admin já existe!');
      } else {
        // 5. Criar usuário admin usando SQL raw
        server.log.info('👤 Criando usuário ADMIN...');
        const senhaHash = await bcrypt.hash('admin123', 10);

        await prisma.$executeRaw`
          INSERT INTO "User" (
            id, tenant_id, nome, email, senha_hash, tipo, ativo,
            status_conta, primeiro_acesso, created_at, updated_at
          ) VALUES (
            gen_random_uuid(),
            ${tenantId}::uuid,
            'Administrador Vivoly',
            'admin@vivoly.com',
            ${senhaHash},
            'ADMIN',
            true,
            'ATIVO',
            false,
            NOW(),
            NOW()
          )
        `;

        server.log.info('✅ ADMIN criado com sucesso!');
        adminCreated = true;
      }

      // 6. Buscar dados finais
      const users = await prisma.$queryRaw<any[]>`
        SELECT id, nome, email, tipo
        FROM "User"
        WHERE tenant_id = ${tenantId}::uuid
      `;

      return {
        success: true,
        message: adminCreated
          ? 'Tenant e ADMIN criados com sucesso!'
          : 'Tenant já existia. Nenhuma ação necessária.',
        tenant_id: tenantId,
        users_count: users.length,
        users: users.map(u => ({
          email: u.email,
          tipo: u.tipo
        })),
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
          '✅ Fazer login em https://vivoly.integrius.com.br',
          'Email: admin@vivoly.com',
          'Senha: admin123'
        ]
      };

    } catch (error: any) {
      server.log.error('❌ Erro ao criar tenant e admin:', error);
      return reply.status(500).send({
        error: 'Erro ao criar tenant e admin',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
