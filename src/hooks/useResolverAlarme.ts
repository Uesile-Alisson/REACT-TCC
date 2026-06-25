import { useCallback, useState } from 'react';
import { resolveAlarme } from '../services/alarmes.service';
import { getAuthErrorMessage } from '../utils/authErrors';

type UseResolverAlarmeResult = {
  isResolving: boolean;
  resolveError: string | null;
  resolveSuccess: string | null;
  clearResolveFeedback: () => void;
  resolverAlarme: (idAlarme: number, observacao: string) => Promise<boolean>;
};

export function useResolverAlarme(onDone: () => Promise<void>): UseResolverAlarmeResult {
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolveSuccess, setResolveSuccess] = useState<string | null>(null);

  const clearResolveFeedback = useCallback(() => {
    setResolveError(null);
    setResolveSuccess(null);
  }, []);

  const resolverAlarme = useCallback(
    async (idAlarme: number, observacao: string): Promise<boolean> => {
      setIsResolving(true);
      setResolveError(null);
      setResolveSuccess(null);

      try {
        await resolveAlarme(idAlarme, { observacao: observacao.trim() || undefined });
        setResolveSuccess('Alarme resolvido com sucesso.');
        await onDone();

        return true;
      } catch (error: unknown) {
        setResolveError(getAuthErrorMessage(error));

        return false;
      } finally {
        setIsResolving(false);
      }
    },
    [onDone],
  );

  return {
    isResolving,
    resolveError,
    resolveSuccess,
    clearResolveFeedback,
    resolverAlarme,
  };
}
