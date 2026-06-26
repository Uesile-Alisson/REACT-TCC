import { useCallback, useState } from 'react';
import { generateAlarmReport } from '../services/relatorios.service';
import { getAuthErrorMessage } from '../utils/authErrors';

type UseGerarRelatorioAlarmeResult = {
  generatingAlarmeReportId: number | null;
  alarmeReportError: string | null;
  alarmeReportSuccess: string | null;
  clearAlarmeReportFeedback: () => void;
  gerarRelatorioAlarme: (idAlarme: number) => Promise<boolean>;
};

export function useGerarRelatorioAlarme(): UseGerarRelatorioAlarmeResult {
  const [generatingAlarmeReportId, setGeneratingAlarmeReportId] = useState<number | null>(null);
  const [alarmeReportError, setAlarmeReportError] = useState<string | null>(null);
  const [alarmeReportSuccess, setAlarmeReportSuccess] = useState<string | null>(null);

  const clearAlarmeReportFeedback = useCallback((): void => {
    setAlarmeReportError(null);
    setAlarmeReportSuccess(null);
  }, []);

  const gerarRelatorioAlarme = useCallback(async (idAlarme: number): Promise<boolean> => {
    setGeneratingAlarmeReportId(idAlarme);
    setAlarmeReportError(null);
    setAlarmeReportSuccess(null);

    try {
      await generateAlarmReport(idAlarme, { formato: 'PDF' });
      setAlarmeReportSuccess(`Relatorio do alarme #${idAlarme} gerado com sucesso.`);

      return true;
    } catch (error: unknown) {
      setAlarmeReportError(getAuthErrorMessage(error));

      return false;
    } finally {
      setGeneratingAlarmeReportId(null);
    }
  }, []);

  return {
    generatingAlarmeReportId,
    alarmeReportError,
    alarmeReportSuccess,
    clearAlarmeReportFeedback,
    gerarRelatorioAlarme,
  };
}
