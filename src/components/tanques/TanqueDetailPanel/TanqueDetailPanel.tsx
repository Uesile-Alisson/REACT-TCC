import type { TanqueConfigResponse } from '../../../types';
import { TanqueStatusBadge } from '../TanqueStatusBadge';
import styles from './TanqueDetailPanel.module.scss';

type TanqueDetailPanelProps = {
  tanque: TanqueConfigResponse | null;
  canEdit: boolean;
  canCreateSensor: boolean;
  canToggleActive: boolean;
  isSubmitting: boolean;
  onEdit: (tanque: TanqueConfigResponse) => void;
  onCreateSensor: (tanque: TanqueConfigResponse) => void;
  onToggleActive: (tanque: TanqueConfigResponse) => void;
};

export function TanqueDetailPanel({
  tanque,
  canEdit,
  canCreateSensor,
  canToggleActive,
  isSubmitting,
  onEdit,
  onCreateSensor,
  onToggleActive,
}: TanqueDetailPanelProps) {
  if (!tanque) {
    return (
      <aside className={styles.panel} aria-label="Detalhes do tanque">
        <span className={styles.overline}>Detalhe tecnico</span>
        <h2>Sem tanque selecionado</h2>
        <p>Selecione um tanque na lista para visualizar os parametros.</p>
        <div className={styles.schemaBox}>
          <strong>Campos integrados</strong>
          <span>nome, volume, unidade_volume, vacuo_padrao e status_tanque.</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.panel} aria-label="Detalhes do tanque">
      <span className={styles.overline}>Detalhe tecnico</span>
      <div className={styles.titleRow}>
        <h2>{tanque.nome}</h2>
        <TanqueStatusBadge status={tanque.status_tanque} />
      </div>

      <dl className={styles.dataGrid}>
        <div>
          <dt>ID</dt>
          <dd>{tanque.id_tanque}</dd>
        </div>
        <div>
          <dt>Capacidade</dt>
          <dd>
            {tanque.volume.toLocaleString('pt-BR')} {tanque.unidade_volume}
          </dd>
        </div>
        <div>
          <dt>Vacuo padrao</dt>
          <dd>{tanque.vacuo_padrao.toLocaleString('pt-BR')} kPa manometrico</dd>
        </div>
        <div>
          <dt>Atualizado em</dt>
          <dd>{new Date(tanque.atualizado_em).toLocaleString('pt-BR')}</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <button type="button" onClick={() => onEdit(tanque)} disabled={!canEdit || isSubmitting}>
          Editar
        </button>
        <button
          type="button"
          onClick={() => onCreateSensor(tanque)}
          disabled={!canCreateSensor || isSubmitting}
        >
          Novo sensor
        </button>
        <button
          type="button"
          onClick={() => onToggleActive(tanque)}
          disabled={!canToggleActive || isSubmitting}
        >
          {tanque.status_tanque === 'ATIVO' ? 'Desativar' : 'Ativar'}
        </button>
      </div>
    </aside>
  );
}
