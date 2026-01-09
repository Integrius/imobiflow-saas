/**
 * Serviço de geração de senhas temporárias
 *
 * Gera senhas aleatórias de 6 caracteres (letras + números)
 * sem caracteres ambíguos (O/0, I/1/l)
 */

export class PasswordGeneratorService {
  /**
   * Caracteres permitidos (sem ambiguidades: sem O/0, I/1/l)
   */
  private static readonly CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz';

  /**
   * Gera senha aleatória de 6 caracteres
   *
   * Exemplo: "Kx8mQ2"
   *
   * @param length Tamanho da senha (padrão: 6)
   * @returns Senha aleatória
   */
  static generate(length: number = 6): string {
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * this.CHARS.length);
      password += this.CHARS[randomIndex];
    }

    return password;
  }

  /**
   * Calcula data de expiração (12 horas a partir de agora)
   *
   * @returns Data de expiração
   */
  static getExpirationDate(): Date {
    const now = new Date();
    return new Date(now.getTime() + 12 * 60 * 60 * 1000); // +12 horas
  }

  /**
   * Verifica se senha temporária expirou
   *
   * @param expirationDate Data de expiração
   * @returns true se expirou, false se ainda válida
   */
  static isExpired(expirationDate: Date): boolean {
    return new Date() > expirationDate;
  }
}
