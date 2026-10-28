import { useCallback, useMemo, useState } from 'react';
import type { FormErrors, FormField, FormValue, FormValues } from '../types/form';
import { hasAnsweredRequired, validateForm } from '../utils/validation';

function buildInitialValues(fields: FormField[]): FormValues {
  const initial: FormValues = {};
  for (const field of fields) {
    initial[field.id] = field.type === 'checkbox' || field.type === 'switch' ? false : '';
  }
  return initial;
}

export function useDynamicForm(fields: FormField[]) {
  const [values, setValues] = useState<FormValues>(() => buildInitialValues(fields));
  const [errors, setErrors] = useState<FormErrors>({});

  const changeValue = useCallback((id: string, value: FormValue) => {
    setValues((previous) => ({ ...previous, [id]: value }));
    setErrors((previous) => {
      if (!previous[id]) return previous;
      const next = { ...previous };
      delete next[id];
      return next;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const nextErrors = validateForm(fields, values);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [fields, values]);

  const reset = useCallback(() => {
    setValues(buildInitialValues(fields));
    setErrors({});
  }, [fields]);

  const progress = useMemo(() => {
    const required = fields.filter((field) => field.required);
    const completed = required.filter((field) => hasAnsweredRequired(field, values[field.id]));
    return { completed: completed.length, total: required.length };
  }, [fields, values]);

  return { values, errors, changeValue, validate, reset, progress };
}
