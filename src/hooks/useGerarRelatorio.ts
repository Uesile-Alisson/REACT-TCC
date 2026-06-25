import { useCallback, useState } from 'react';
import { generateAlarmReport, generateProcessReport } from '../services/relatorios.service';
import type { FormatoRelatorio, GerarRelatorioFormState, TipoRelatorio } from '../types';
import { getAuthErrorMessage } from '../utils/authErrors';

type UseGerarRelatorioResult = {
  isGenerating: boolean;
  generationError: string | null;
  generationSuccess: string | null;
  clearGenerationFeedback: () => void;
  gerarRelatorio: (formState: GerarRelatorioFormState) => Promise<boolean>;
};

function parseOriginId(idOrigem: string): number | null {
  const parsed = Number(idOrigem);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function getSelectedFormatos(formState: GerarRelatorioFormState): FormatoRelatorio[] {
  const formatos: FormatoRelatorio[] = [];

  if (formState.gerarPdf) {
    formatos.push('PDF');
  }

  if (formState.tipo === 'PROCESSO' && formState.gerarXlsx) {
    formatos.push('XLSX');
  }

  return formatos;
}

function getSuccessMessage(tipo: TipoRelatorio): string {
  return tipo === 'ALARME'
    ? 'Relatorio de alarme solicitado com sucesso.'
    : 'Relatorio de processo solicitado com sucesso.';
}

export function useGerarRelatorio(): UseGerarRelatorioResult {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState<string | null>(null);

  const clearGenerationFeedback = useCallback((): void => {
    setGenerationError(null);
    setGenerationSuccess(null);
  }, []);

  const gerarRelatorio = useCallback(async (formState: GerarRelatorioFormState): Promise<boolean> => {
    const idOrigem = parseOriginId(formState.idOrigem);
    const formatos = getSelectedFormatos(formState);

    setGenerationError(null);
    setGenerationSuccess(null);

    if (!idOrigem) {
      setGenerationError('Informe um identificador valido para gerar o relatorio.');
      return false;
    }

    if (formatos.length === 0) {
      setGenerationError('Selecione ao menos um formato disponivel.');
      return false;
    }

    setIsGenerating(true);

    try {
      if (formState.tipo === 'ALARME') {
        await generateAlarmReport(idOrigem, {
          formato: 'PDF',
          observacao: formState.observacao.trim() || undefined,
        });
      } else {
        await generateProcessReport(idOrigem, {
          formatos,
          observacao: formState.observacao.trim() || undefined,
        });
      }

      setGenerationSuccess(getSuccessMessage(formState.tipo));
      return true;
    } catch (error: unknown) {
      setGenerationError(getAuthErrorMessage(error));
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    generationError,
    generationSuccess,
    clearGenerationFeedback,
    gerarRelatorio,
  };
}
