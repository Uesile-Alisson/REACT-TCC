import type { FormatoRelatorio, TipoRelatorio } from './common.types';
import type { RelatorioResponse } from './relatorios.types';

export type RelatoriosFiltersState = {
  tipo_relatorio: TipoRelatorio | '';
  formato: FormatoRelatorio | '';
  id_processo: string;
  id_alarme: string;
  data_inicio: string;
  data_fim: string;
};

export type RelatoriosPageData = {
  relatorios: RelatorioResponse[];
  selectedRelatorio: RelatorioResponse | null;
  total: number;
  page: number;
  limit: number;
};

export type RelatoriosPermissions = {
  canViewRelatorios: boolean;
  canViewRelatorioDetail: boolean;
  canPreviewRelatorio: (relatorio: RelatorioResponse) => boolean;
  canDownloadRelatorio: (relatorio: RelatorioResponse) => boolean;
  canGenerateRelatorio: boolean;
};

export type GerarRelatorioFormState = {
  tipo: TipoRelatorio;
  idOrigem: string;
  gerarPdf: boolean;
  gerarXlsx: boolean;
  observacao: string;
};
