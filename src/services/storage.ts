import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FormSubmission } from '../types/form';
import { parseStoredSubmissions } from '../utils/submissions';

const STORAGE_KEY = '@checkpoint3:formulario-dinamico:envios:v1';

export async function loadSubmissions(): Promise<FormSubmission[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? parseStoredSubmissions(raw) : [];
}

export async function saveSubmissions(submissions: FormSubmission[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

export async function clearSubmissions(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
