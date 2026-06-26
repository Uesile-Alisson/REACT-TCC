import { useCallback, useEffect, useRef, useState } from 'react';
import { previewRelatorio } from '../services/relatorios.service';
import type { RelatorioResponse } from '../types/relatorios.types';
import type { FormatoRelatorio } from '../types/common.types';
import { createObjectUrl, revokeObjectUrl } from '../utils/files';
import { getAuthErrorMessage } from '../utils/authErrors';

type RelatorioPreviewState = {
  isPreviewOpen: boolean;
  previewUrl: string | null;
  previewFilename: string | null;
  previewContentType: string | null;
  previewFormat: FormatoRelatorio | null;
  isPreviewLoading: boolean;
  previewError: string | null;
};

type UseRelatorioPreviewResult = RelatorioPreviewState & {
  openPreview: (relatorio: RelatorioResponse) => Promise<void>;
  closePreview: () => void;
};

const initialState: RelatorioPreviewState = {
  isPreviewOpen: false,
  previewUrl: null,
  previewFilename: null,
  previewContentType: null,
  previewFormat: null,
  isPreviewLoading: false,
  previewError: null,
};

function isPdfRelatorio(relatorio: RelatorioResponse): boolean {
  return relatorio.formato === 'PDF' || relatorio.content_type === 'application/pdf';
}

function getFallbackPreviewFilename(relatorio: RelatorioResponse): string {
  const extension = relatorio.formato === 'XLSX' ? 'xlsx' : 'pdf';

  return relatorio.nome_arquivo ?? `relatorio-${relatorio.id_relatorio}.${extension}`;
}

function isXlsxRelatorio(relatorio: RelatorioResponse): boolean {
  return (
    relatorio.formato === 'XLSX' ||
    relatorio.content_type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}

export function useRelatorioPreview(): UseRelatorioPreviewResult {
  const [state, setState] = useState<RelatorioPreviewState>(initialState);
  const currentObjectUrlRef = useRef<string | null>(null);

  const clearObjectUrl = useCallback((): void => {
    revokeObjectUrl(currentObjectUrlRef.current);
    currentObjectUrlRef.current = null;
  }, []);

  const closePreview = useCallback((): void => {
    clearObjectUrl();
    setState(initialState);
  }, [clearObjectUrl]);

  const openPreview = useCallback(
    async (relatorio: RelatorioResponse): Promise<void> => {
      if (!isPdfRelatorio(relatorio) && !isXlsxRelatorio(relatorio)) {
        setState((currentState) => ({
          ...currentState,
          isPreviewOpen: true,
          previewError: 'Preview esta disponivel apenas para relatorios PDF ou XLSX.',
        }));
        return;
      }

      clearObjectUrl();
      setState({
        isPreviewOpen: true,
        previewUrl: null,
        previewFilename: getFallbackPreviewFilename(relatorio),
        previewContentType: relatorio.content_type ?? null,
        previewFormat: relatorio.formato ?? null,
        isPreviewLoading: true,
        previewError: null,
      });

      try {
        const file = await previewRelatorio(relatorio.id_relatorio);
        const objectUrl = createObjectUrl(file.blob);
        currentObjectUrlRef.current = objectUrl;

        setState({
          isPreviewOpen: true,
          previewUrl: objectUrl,
          previewFilename: file.filename ?? getFallbackPreviewFilename(relatorio),
          previewContentType: file.contentType ?? relatorio.content_type ?? null,
          previewFormat: relatorio.formato ?? null,
          isPreviewLoading: false,
          previewError: null,
        });
      } catch (error: unknown) {
        setState((currentState) => ({
          ...currentState,
          isPreviewLoading: false,
          previewError: getAuthErrorMessage(error),
        }));
      }
    },
    [clearObjectUrl],
  );

  useEffect(() => clearObjectUrl, [clearObjectUrl]);

  return {
    ...state,
    openPreview,
    closePreview,
  };
}
