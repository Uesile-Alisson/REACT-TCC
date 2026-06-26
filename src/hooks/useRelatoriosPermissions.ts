import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { RelatorioResponse, RelatoriosPermissions } from '../types';

function isTechnicalRole(role?: string | null): boolean {
  return role === 'TECNICO' || role === 'ADMINISTRADOR';
}

function isPdfRelatorio(relatorio: RelatorioResponse): boolean {
  return relatorio.formato === 'PDF' || relatorio.content_type === 'application/pdf';
}

function isPreviewableRelatorio(relatorio: RelatorioResponse): boolean {
  return (
    isPdfRelatorio(relatorio) ||
    relatorio.formato === 'XLSX' ||
    relatorio.content_type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}

export function useRelatoriosPermissions(): RelatoriosPermissions {
  const { user } = useAuth();
  const role = user?.nivel_acesso ?? null;
  const canGenerateRelatorio = isTechnicalRole(role);

  return useMemo(
    () => ({
      canViewRelatorios: Boolean(role),
      canViewRelatorioDetail: Boolean(role),
      canPreviewRelatorio: (relatorio: RelatorioResponse): boolean =>
        Boolean(role) && isPreviewableRelatorio(relatorio),
      canDownloadRelatorio: (relatorio: RelatorioResponse): boolean => {
        if (!isTechnicalRole(role)) {
          return false;
        }

        if (relatorio.tipo_relatorio === 'ALARME') {
          return relatorio.formato === 'PDF';
        }

        return relatorio.formato === 'PDF' || relatorio.formato === 'XLSX';
      },
      canGenerateRelatorio,
    }),
    [canGenerateRelatorio, role],
  );
}
