import type { FormField, FormValue } from '../types/form';

export function maskDate(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function displayFieldValue(field: FormField, value: FormValue | undefined): string {
  if (field.type === 'password') return value ? '••••••••' : '—';
  if (field.type === 'checkbox' || field.type === 'switch') {
    return value === true ? 'Sim' : 'Não';
  }
  if (typeof value !== 'string' || value.trim() === '') return 'Não informado';
  if (field.options) {
    return field.options.find((option) => option.value === value)?.label ?? value;
  }
  return value;
}

export function formatSubmissionDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Data indisponível';
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
