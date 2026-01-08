import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { PasswordResetService } from './password-reset.service';
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware';
import { AppError } from '../../shared/errors/AppError';

const prisma = new PrismaClient();
const passwordResetService = new PasswordResetService(prisma);

export async function passwordResetRoutes(server: FastifyInstance) {
  /**
   * POST /api/v1/auth/forgot-password
   * Solicita reset de senha - envia token por email
   */
  server.post(
    '/forgot-password',
    {
      preHandler: [tenantMiddleware]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email } = request.body as { email: string };
        const tenantId = (request as any).tenantId;

        if (!email || !email.trim()) {
          throw new AppError('Email é obrigatório', 400);
        }

        // Validação básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new AppError('Email inválido', 400);
        }

        // Gerar e enviar token
        await passwordResetService.requestPasswordReset(email.toLowerCase().trim(), tenantId);

        // Sempre retornar sucesso (por segurança, não revelar se email existe)
        return reply.send({
          success: true,
          message: 'Se o email estiver cadastrado, você receberá um código de verificação em até 5 minutos.'
        });
      } catch (error: any) {
        console.error('Erro em forgot-password:', error);
        return reply.status(error.statusCode || 500).send({
          error: error.message || 'Erro ao processar solicitação'
        });
      }
    }
  );

  /**
   * POST /api/v1/auth/reset-password
   * Reseta senha usando token recebido por email
   */
  server.post(
    '/reset-password',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email, token, novaSenha } = request.body as {
          email: string;
          token: string;
          novaSenha: string;
        };

        // Validações
        if (!email || !token || !novaSenha) {
          throw new AppError('Email, token e nova senha são obrigatórios', 400);
        }

        if (novaSenha.length < 6) {
          throw new AppError('A senha deve ter no mínimo 6 caracteres', 400);
        }

        if (token.length !== 6 || !/^\d{6}$/.test(token)) {
          throw new AppError('Token deve conter 6 dígitos', 400);
        }

        // Resetar senha
        await passwordResetService.resetPassword(
          email.toLowerCase().trim(),
          token,
          novaSenha
        );

        return reply.send({
          success: true,
          message: 'Senha resetada com sucesso! Você já pode fazer login.'
        });
      } catch (error: any) {
        console.error('Erro em reset-password:', error);
        return reply.status(error.statusCode || 500).send({
          error: error.message || 'Erro ao resetar senha'
        });
      }
    }
  );
}
