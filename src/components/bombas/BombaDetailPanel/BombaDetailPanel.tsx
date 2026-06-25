import type { BombaConfigResponse } from '../../../types';
import { BombaStatusBadge } from '../BombaStatusBadge';
import styles from './BombaDetailPanel.module.scss';

type BombaDetailPanelProps = {
  bomba: BombaConfigResponse | null;
  endpointMissing: boolean;
};

export function BombaDetailPanel({ bomba, endpointMissing }: BombaDetailPanelProps) {
  if (!bomba) {
    return (
      <aside className={styles.panel} aria-label="Detalhes da bomba">
        <span className={styles.overline}>Detalhe tecnico</span>
        <h2>Sem bomba selecionada</h2>
        <p>
          {endpointMissing
            ? 'Os detalhes serao preenchidos quando o backend disponibilizar consulta HTTP de bombas.'
            : 'Selecione uma bomba na lista para visualizar os parametros.'}
        </p>
        <div className={styles.schemaBox}>
          <strong>Campos confirmados no schema</strong>
          <span>nome, tipo_bomba, status_padrao, entrada_por_pressao e entrada_por_tempo.</span>
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
    </aside>
  );
}
