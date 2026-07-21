import type { TanqueConfigResponse } from '../../../types';
import { TanqueStatusBadge } from '../TanqueStatusBadge';
import styles from './TanquesListTable.module.scss';

type TanquesListTableProps = {
  tanques: TanqueConfigResponse[];
  selectedTanqueId?: number;
  isLoading: boolean;
  onSelect: (id_tanque: number) => void;
};

export function TanquesListTable({
  tanques,
  selectedTanqueId,
  isLoading,
  onSelect,
}: TanquesListTableProps) {
  return (
    <section className={styles.panel} aria-label="Lista de tanques">
      <div className={styles.panelHeader}>
        <div>
          <span>Cadastro tecnico</span>
          <h2>Tanques</h2>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Capacidade</th>
              <th>Vacuo padrao (kPa)</th>
              <th>Status</th>
              <th>Atualizacao</th>
            </tr>
          </thead>
          <tbody>
            {tanques.map((tanque) => (
              <tr
                className={tanque.id_tanque === selectedTanqueId ? styles.selected : undefined}
                key={tanque.id_tanque}
                onClick={() => onSelect(tanque.id_tanque)}
              >
                <td>
                  <strong>{tanque.nome}</strong>
                  <small>ID {tanque.id_tanque}</small>
                </td>
                <td>
                  {tanque.volume.toLocaleString('pt-BR')} {tanque.unidade_volume}
                </td>
                <td>{tanque.vacuo_padrao.toLocaleString('pt-BR')} kPa</td>
                <td>
                  <TanqueStatusBadge status={tanque.status_tanque} />
                </td>
                <td>{new Date(tanque.atualizado_em).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading ? <div className={styles.emptyState}>Atualizando registros...</div> : null}

        {!isLoading && tanques.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>Nenhum tanque configurado.</strong>
            <span>Nenhum registro retornado pela API.</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
