import type { BombaConfigResponse } from '../../../types';
import { BombaStatusBadge } from '../BombaStatusBadge';
import styles from './BombaDetailPanel.module.scss';

type BombaDetailPanelProps = {
  bomba: BombaConfigResponse | null;
  canEdit: boolean;
  canToggleActive: boolean;
  isSubmitting: boolean;
  onEdit: (bomba: BombaConfigResponse) => void;
  onToggleActive: (bomba: BombaConfigResponse) => void;
};

export function BombaDetailPanel({
  bomba,
  canEdit,
  canToggleActive,
  isSubmitting,
  onEdit,
  onToggleActive,
}: BombaDetailPanelProps) {
  if (!bomba) {
    return (
      <aside className={styles.panel} aria-label="Detalhes da bomba">
        <span className={styles.overline}>Detalhe tecnico</span>
        <h2>Sem bomba selecionada</h2>
        <p>Selecione uma bomba na lista para visualizar os parametros.</p>
        <div className={styles.schemaBox}>
          <strong>Campos integrados</strong>
          <span>nome, tipo_bomba, status_padrao, entrada_por_pressao, entrada_por_tempo.</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.panel} aria-label="Detalhes da bomba">
      <span className={styles.overline}>Detalhe tecnico</span>
      <div className={styles.titleRow}>
        <h2>{bomba.nome}</h2>
        <BombaStatusBadge status={bomba.status_padrao} />
      </div>

      <dl className={styles.dataGrid}>
        <div>
          <dt>ID</dt>
          <dd>{bomba.id_bomba}</dd>
        </div>
        <div>
          <dt>Tipo</dt>
          <dd>{bomba.tipo_bomba}</dd>
        </div>
        <div>
          <dt>Entrada por pressao</dt>
          <dd>{bomba.entrada_por_pressao ? 'Habilitada' : 'Desabilitada'}</dd>
        </div>
        <div>
          <dt>Entrada por tempo</dt>
          <dd>{bomba.entrada_por_tempo ? 'Habilitada' : 'Desabilitada'}</dd>
        </div>
        <div>
          <dt>Atualizado em</dt>
          <dd>{new Date(bomba.atualizado_em).toLocaleString('pt-BR')}</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <button type="button" onClick={() => onEdit(bomba)} disabled={!canEdit || isSubmitting}>
          Editar
        </button>
        <button
          type="button"
          onClick={() => onToggleActive(bomba)}
          disabled={!canToggleActive || isSubmitting}
        >
          {bomba.status_padrao === 'ATIVA' ? 'Desativar' : 'Ativar'}
        </button>
      </div>
    </aside>
  );
}
