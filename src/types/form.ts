export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'multiline'
  | 'textarea'
  | 'select'
  | 'combo'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  placeholder?: string;
  helpText?: string;
}

export interface FormConfiguration {
  title: string;
  description?: string;
  fields: FormField[];
}

export type FormValue = string | boolean;
export type FormValues = Record<string, FormValue>;
export type FormErrors = Record<string, string>;

export interface FormSubmission {
  id: string;
  createdAt: string;
  values: FormValues;
}
