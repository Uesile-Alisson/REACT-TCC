import type { BombaConfigResponse } from '../../../types';
import { BombaStatusBadge } from '../BombaStatusBadge';
import styles from './BombasListTable.module.scss';

type BombasListTableProps = {
  bombas: BombaConfigResponse[];
  selectedBombaId?: number;
  isLoading: boolean;
  endpointMissing: boolean;
  onSelect: (bomba: BombaConfigResponse) => void;
};

export function BombasListTable({
  bombas,
  selectedBombaId,
  isLoading,
  endpointMissing,
  onSelect,
}: BombasListTableProps) {
  return (
    <section className={styles.panel} aria-label="Lista de bombas">
      <div className={styles.panelHeader}>
        <div>
          <span>Cadastro tecnico</span>
          <h2>Bombas</h2>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Status padrao</th>
              <th>Automacao</th>
              <th>Atualizacao</th>
            </tr>
          </thead>
          <tbody>
            {bombas.map((bomba) => (
              <tr
                className={bomba.id_bomba === selectedBombaId ? styles.selected : undefined}
                key={bomba.id_bomba}
                onClick={() => onSelect(bomba)}
              >
                <td>
                  <strong>{bomba.nome}</strong>
                  <small>ID {bomba.id_bomba}</small>
                </td>
                <td>{bomba.tipo_bomba}</td>
                <td>
                  <BombaStatusBadge status={bomba.status_padrao} />
                </td>
                <td>{formatAutomation(bomba)}</td>
                <td>{new Date(bomba.atualizado_em).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading ? <div className={styles.emptyState}>Atualizando registros...</div> : null}

        {!isLoading && bombas.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>Nenhuma bomba carregada.</strong>
            <span>
              {endpointMissing
                ? 'A listagem ficara ativa quando a API expuser uma rota HTTP dedicada.'
                : 'Nenhum registro retornado pela API.'}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function formatAutomation(bomba: BombaConfigResponse): string {
  const modes = [
    bomba.entrada_por_pressao ? 'pressao' : null,
    bomba.entrada_por_tempo ? 'tempo' : null,
  ].filter((mode): mode is string => Boolean(mode));

  return modes.length > 0 ? modes.join(' + ') : 'manual';
}
