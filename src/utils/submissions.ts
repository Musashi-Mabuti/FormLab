import type { FormField, FormSubmission, FormValues } from '../types/form';

const MASK = '••••••••';
export const MAX_SUBMISSIONS = 20;

export function valuesForStorage(fields: FormField[], values: FormValues): FormValues {
  const safeValues: FormValues = {};
  for (const field of fields) {
    const value = values[field.id];
    safeValues[field.id] = field.type === 'password' ? (value ? MASK : '') : value ?? '';
  }
  return safeValues;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSubmission(value: unknown): value is FormSubmission {
  if (!isObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.createdAt !== 'string') return false;
  if (!isObject(value.values)) return false;
  return Object.values(value.values).every(
    (item) => typeof item === 'string' || typeof item === 'boolean',
  );
}

export function parseStoredSubmissions(raw: string): FormSubmission[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isSubmission)) {
    throw new Error('O conteúdo salvo está em um formato inválido.');
  }
  return parsed.slice(0, MAX_SUBMISSIONS);
}
