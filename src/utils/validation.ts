import type { FormErrors, FormField, FormValue, FormValues } from '../types/form';

function isEmpty(value: FormValue | undefined): boolean {
  return value === undefined || (typeof value === 'string' && value.trim().length === 0);
}

export function isValidDateBR(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

export function validateField(field: FormField, value: FormValue | undefined): string | null {
  if (field.type === 'checkbox') {
    return field.required && value !== true ? 'Marque esta opção para continuar.' : null;
  }

  if (field.type === 'switch') {
    return typeof value !== 'boolean' ? 'Escolha uma opção válida.' : null;
  }

  if (field.required && isEmpty(value)) return 'Este campo é obrigatório.';
  if (isEmpty(value)) return null;
  if (typeof value !== 'string') return 'Valor inválido para este campo.';

  switch (field.type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        ? null
        : 'Informe um e-mail válido.';
    case 'number': {
      const normalized = value.trim().replace(',', '.');
      return /^-?\d+(?:\.\d+)?$/.test(normalized) && Number.isFinite(Number(normalized))
        ? null
        : 'Digite um número válido.';
    }
    case 'date':
      return isValidDateBR(value) ? null : 'Informe uma data válida (DD/MM/AAAA).';
    case 'radio':
    case 'select':
    case 'combo':
      return field.options?.some((option) => option.value === value)
        ? null
        : 'Selecione uma das opções disponíveis.';
    default:
      return null;
  }
}

export function validateForm(fields: FormField[], values: FormValues): FormErrors {
  const errors: FormErrors = {};
  for (const field of fields) {
    const error = validateField(field, values[field.id]);
    if (error) errors[field.id] = error;
  }
  return errors;
}

export function hasAnsweredRequired(field: FormField, value: FormValue | undefined): boolean {
  if (!field.required) return false;
  if (field.type === 'checkbox') return value === true;
  if (field.type === 'switch') return typeof value === 'boolean';
  return !isEmpty(value);
}
