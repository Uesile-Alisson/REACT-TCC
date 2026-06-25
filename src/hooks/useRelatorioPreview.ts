import { useCallback, useEffect, useRef, useState } from 'react';
import { previewRelatorio } from '../services/relatorios.service';
import type { RelatorioResponse } from '../types/relatorios.types';
import { createObjectUrl, revokeObjectUrl } from '../utils/files';
import { getAuthErrorMessage } from '../utils/authErrors';

type RelatorioPreviewState = {
  isPreviewOpen: boolean;
  previewUrl: string | null;
  previewFilename: string | null;
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
  isPreviewLoading: false,
  previewError: null,
};

function isPdfRelatorio(relatorio: RelatorioResponse): boolean {
  return relatorio.formato === 'PDF' || relatorio.content_type === 'application/pdf';
}

function getFallbackPreviewFilename(relatorio: RelatorioResponse): string {
  return relatorio.nome_arquivo ?? `relatorio-${relatorio.id_relatorio}.pdf`;
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
      if (!isPdfRelatorio(relatorio)) {
        setState((currentState) => ({
          ...currentState,
          isPreviewOpen: true,
          previewError: 'Preview esta disponivel apenas para relatorios PDF.',
        }));
        return;
      }

      clearObjectUrl();
      setState({
        isPreviewOpen: true,
        previewUrl: null,
        previewFilename: getFallbackPreviewFilename(relatorio),
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
