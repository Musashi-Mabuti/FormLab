import { useCallback, useEffect, useState } from 'react';
import type { FormSubmission } from '../types/form';
import { clearSubmissions, loadSubmissions, saveSubmissions } from '../services/storage';
import { MAX_SUBMISSIONS } from '../utils/submissions';

type StorageStatus = 'loading' | 'ready' | 'saving' | 'clearing';

export function usePersistedSubmissions() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [status, setStatus] = useState<StorageStatus>('loading');
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const saved = await loadSubmissions();
        if (active) setSubmissions(saved);
      } catch {
        if (active) setStorageError('Não foi possível recuperar os envios anteriores.');
      } finally {
        if (active) setStatus('ready');
      }
    }
    void restore();
    return () => { active = false; };
  }, []);

  const addSubmission = useCallback(async (submission: FormSubmission): Promise<boolean> => {
    if (status !== 'ready') return false;
    setStatus('saving');
    setStorageError(null);
    const next = [submission, ...submissions].slice(0, MAX_SUBMISSIONS);
    try {
      await saveSubmissions(next);
      setSubmissions(next);
      return true;
    } catch {
      setStorageError('Falha ao salvar. Verifique o armazenamento do dispositivo.');
      return false;
    } finally {
      setStatus('ready');
    }
  }, [status, submissions]);

  const removeAll = useCallback(async (): Promise<boolean> => {
    if (status !== 'ready') return false;
    setStatus('clearing');
    setStorageError(null);
    try {
      await clearSubmissions();
      setSubmissions([]);
      return true;
    } catch {
      setStorageError('Não foi possível excluir os dados salvos.');
      return false;
    } finally {
      setStatus('ready');
    }
  }, [status]);

  return {
    submissions,
    status,
    storageError,
    addSubmission,
    removeAll,
  };
}
