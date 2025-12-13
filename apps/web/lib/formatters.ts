/**
 * Funções de formatação de valores para o padrão brasileiro
 */

/**
 * Formata telefone para o padrão brasileiro (xx) xxxxx-xxxx
 */
export function formatPhone(value: string): string {
  if (!value) return '';

  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');

  // Limita a 11 dígitos (DDD + 9 dígitos)
  const limited = numbers.slice(0, 11);

  // Aplica a máscara
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  } else if (limited.length <= 10) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`;
  }
}

/**
 * Formata CPF para o padrão brasileiro xxx.xxx.xxx-xx
 */
export function formatCPF(value: string): string {
  if (!value) return '';

  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');

  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);

  // Aplica a máscara
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9, 11)}`;
  }
}

/**
 * Formata CEP para o padrão brasileiro xxxxx-xxx
 */
export function formatCEP(value: string): string {
  if (!value) return '';

  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');

  // Limita a 8 dígitos
  const limited = numbers.slice(0, 8);

  // Aplica a máscara
  if (limited.length <= 5) {
    return limited;
  } else {
    return `${limited.slice(0, 5)}-${limited.slice(5, 8)}`;
  }
}

/**
 * Formata valor monetário para entrada do usuário
 * Permite digitar apenas números e formata automaticamente
 */
export function formatCurrencyInput(value: string): string {
  if (!value) return '';

  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');

  // Converte para número dividindo por 100 (centavos)
  const numericValue = parseFloat(numbers) / 100;

  // Formata para moeda brasileira
  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata número para exibição em moeda brasileira
 */
export function formatCurrencyDisplay(value: number | string | null | undefined): string {
  if (!value) return 'R$ 0,00';

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) return 'R$ 0,00';

  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Remove formatação de moeda e retorna número
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;

  // Remove tudo que não é número, vírgula ou ponto
  const cleaned = value.replace(/[^\d,]/g, '');

  // Substitui vírgula por ponto
  const normalized = cleaned.replace(',', '.');

  return parseFloat(normalized) || 0;
}

/**
 * Remove formatação e retorna apenas números
 */
export function unformatNumbers(value: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}
