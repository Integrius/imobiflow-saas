import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../../shared/errors/AppError';
import { sendGridService } from '../../shared/services/sendgrid.service';

export class PasswordResetService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Gera token de reset de senha de 6 dígitos e envia por email
   */
  async requestPasswordReset(email: string, tenantId: string): Promise<void> {
    // Buscar usuário pelo email e tenant
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        tenant_id: tenantId,
        ativo: true
      },
      include: {
        tenant: true
      }
    });

    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      console.log(`⚠️  Tentativa de reset para email não encontrado: ${email}`);
      return;
    }

    // Gerar token de 6 dígitos
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // Data de expiração: 5 minutos
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    // Deletar tokens antigos do usuário (cleanup)
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        email,
        OR: [
          { expires: { lt: new Date() } }, // Tokens expirados
          { usado: true } // Tokens já usados
        ]
      }
    });

    // Criar novo token
    await this.prisma.passwordResetToken.create({
      data: {
        user_id: user.id,
        email,
        token,
        expires
      }
    });

    // Enviar email com token
    await sendGridService.sendPasswordResetEmail(
      email,
      user.nome,
      user.tenant.nome,
      token
    );

    console.log(`✅ Token de reset enviado para ${email}`);
  }

  /**
   * Valida token e reseta senha
   */
  async resetPassword(email: string, token: string, novaSenha: string): Promise<void> {
    // Buscar token válido
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        email,
        token,
        usado: false,
        expires: {
          gt: new Date() // Token não expirado
        }
      }
    });

    if (!resetToken) {
      throw new AppError('Token inválido ou expirado', 400);
    }

    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { id: resetToken.user_id }
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Hash da nova senha
    const senha_hash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha do usuário
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        senha_hash,
        primeiro_acesso: false // Se estava em primeiro acesso, agora não está mais
      }
    });

    // Marcar token como usado
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        usado: true,
        usado_em: new Date()
      }
    });

    console.log(`✅ Senha resetada para usuário ${user.email}`);
  }

  /**
   * Limpa tokens expirados (job de limpeza)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expires: { lt: new Date() } },
          { usado: true, usado_em: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Tokens usados há mais de 24h
        ]
      }
    });

    console.log(`🧹 ${result.count} tokens de reset limpos`);
    return result.count;
  }
}
