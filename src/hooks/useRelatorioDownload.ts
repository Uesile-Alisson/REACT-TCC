import { useCallback, useState } from 'react';
import { downloadRelatorio } from '../services/relatorios.service';
import type { NivelAcesso } from '../types';
import type { RelatorioResponse } from '../types/relatorios.types';
import { downloadBlobFile } from '../utils/files';
import { getAuthErrorMessage } from '../utils/authErrors';

type UseRelatorioDownloadResult = {
  downloadingId: number | null;
  downloadError: string | null;
  canDownloadRelatorio: (relatorio: RelatorioResponse) => boolean;
  handleDownloadRelatorio: (relatorio: RelatorioResponse) => Promise<void>;
};

type UseRelatorioDownloadParams = {
  nivelAcesso?: NivelAcesso | null;
};

function canDownloadByProfile(nivelAcesso?: NivelAcesso | null): boolean {
  return nivelAcesso === 'TECNICO' || nivelAcesso === 'ADMINISTRADOR';
}

function getRelatorioExtension(relatorio: RelatorioResponse): string {
  return relatorio.formato === 'XLSX' ? 'xlsx' : 'pdf';
}

function getRelatorioKind(relatorio: RelatorioResponse): string {
  return relatorio.tipo_relatorio === 'ALARME' ? 'alarme' : 'processo';
}

function getFallbackDownloadFilename(relatorio: RelatorioResponse): string {
  return (
    relatorio.nome_arquivo ??
    `relatorio-${getRelatorioKind(relatorio)}-${relatorio.id_relatorio}.${getRelatorioExtension(relatorio)}`
  );
}

export function useRelatorioDownload({
  nivelAcesso,
}: UseRelatorioDownloadParams): UseRelatorioDownloadResult {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const canDownloadRelatorio = useCallback(
    (relatorio: RelatorioResponse): boolean => {
      if (!canDownloadByProfile(nivelAcesso)) {
        return false;
      }

      if (relatorio.tipo_relatorio === 'ALARME') {
        return relatorio.formato === 'PDF';
      }

      return relatorio.formato === 'PDF' || relatorio.formato === 'XLSX';
    },
    [nivelAcesso],
  );

  const handleDownloadRelatorio = useCallback(
    async (relatorio: RelatorioResponse): Promise<void> => {
      if (!canDownloadRelatorio(relatorio)) {
        setDownloadError('Voce nao tem permissao para baixar este relatorio.');
        return;
      }

      setDownloadingId(relatorio.id_relatorio);
      setDownloadError(null);

      try {
        const file = await downloadRelatorio(relatorio.id_relatorio);

        downloadBlobFile({
          blob: file.blob,
          filename: file.filename ?? getFallbackDownloadFilename(relatorio),
        });
      } catch (error: unknown) {
        setDownloadError(getAuthErrorMessage(error));
      } finally {
        setDownloadingId(null);
      }
    },
    [canDownloadRelatorio],
  );

  return {
    downloadingId,
    downloadError,
    canDownloadRelatorio,
    handleDownloadRelatorio,
  };
}
