import { useCallback, useState } from 'react';
import { generateProcessReport } from '../services/relatorios.service';
import { getAuthErrorMessage } from '../utils/authErrors';

type UseGerarRelatorioHistoricoResult = {
  isGenerating: boolean;
  reportError: string | null;
  reportSuccess: string | null;
  clearReportFeedback: () => void;
  gerarRelatorio: (idProcesso: number, observacao?: string) => Promise<void>;
};

export function useGerarRelatorioHistorico(): UseGerarRelatorioHistoricoResult {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  const clearReportFeedback = useCallback(() => {
    setReportError(null);
    setReportSuccess(null);
  }, []);

  const gerarRelatorio = useCallback(async (idProcesso: number, observacao?: string): Promise<void> => {
    setIsGenerating(true);
    setReportError(null);
    setReportSuccess(null);

    try {
      await generateProcessReport(idProcesso, {
        formatos: ['PDF'],
        observacao: observacao?.trim() || undefined,
      });
      setReportSuccess('Relatorio solicitado com sucesso. Acompanhe a listagem em Relatorios.');
    } catch (error: unknown) {
      setReportError(getAuthErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    reportError,
    reportSuccess,
    clearReportFeedback,
    gerarRelatorio,
  };
}
