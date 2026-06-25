import { FilePlus2 } from 'lucide-react';
import type { HistoricoDetailData, HistoricoPermissions, HistoricoProcessoResponse } from '../../../types';
import { formatHistoricoDate, getUnknownNumber, getUnknownString } from '../historico.utils';
import { HistoricoAlarmesPanel } from '../HistoricoAlarmesPanel';
import { HistoricoEventosPanel } from '../HistoricoEventosPanel';
import { HistoricoStatusBadge } from '../HistoricoStatusBadge';
import styles from './HistoricoDetailPanel.module.scss';

type HistoricoDetailPanelProps = {
  detail: HistoricoDetailData;
  isLoading: boolean;
  error?: string;
  tanquesError?: string;
  alarmesError?: string;
  eventosError?: string;
  relatoriosError?: string;
  permissions: HistoricoPermissions;
  onGenerateReport: (processo: HistoricoProcessoResponse) => void;
};

export function HistoricoDetailPanel({
  detail,
  isLoading,
  error,
  tanquesError,
  alarmesError,
  eventosError,
  relatoriosError,
  permissions,
  onGenerateReport,
}: HistoricoDetailPanelProps) {
  const processo = detail.processo;

  if (isLoading) {
    return <section className={styles.panel}>Carregando detalhe historico...</section>;
  }

  if (error) {
    return (
      <section className={styles.panel}>
        <p className={styles.error}>{error}</p>
      </section>
    );
  }

  if (!processo) {
    return (
      <section className={styles.panel}>
        <p className={styles.empty}>Selecione um processo historico para visualizar detalhes.</p>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Detalhe historico</p>
          <h2>{processo.nome_processo ?? `Processo #${processo.id_processo}`}</h2>
        </div>
        <HistoricoStatusBadge status={processo.status_processo} />
      </header>

      <dl className={styles.metrics}>
        <div>
          <dt>Inicio</dt>
          <dd>{formatHistoricoDate(processo.iniciado_em)}</dd>
        </div>
        <div>
          <dt>Fim</dt>
          <dd>{formatHistoricoDate(processo.finalizado_em)}</dd>
        </div>
        <div>
          <dt>Vacuo alvo</dt>
          <dd>{getUnknownNumber(processo, 'vacuo_alvo')}</dd>
        </div>
        <div>
          <dt>Vacuo inicial</dt>
          <dd>{getUnknownNumber(processo, 'vacuo_inicial')}</dd>
        </div>
        <div>
          <dt>Vacuo final</dt>
          <dd>{getUnknownNumber(processo, 'vacuo_final')}</dd>
        </div>
        <div>
          <dt>Vacuo medio</dt>
          <dd>{getUnknownNumber(processo, 'vacuo_medio')}</dd>
        </div>
        <div>
          <dt>Eficiencia</dt>
          <dd>{getUnknownNumber(processo, 'eficiencia')}</dd>
        </div>
        <div>
          <dt>Responsavel</dt>
          <dd>{getUnknownString(processo, 'responsavel')}</dd>
        </div>
      </dl>

      <article className={styles.tanques}>
        <h3>Tanques e sensores</h3>
        {tanquesError ? <p className={styles.error}>{tanquesError}</p> : null}
        {detail.tanques.length > 0 ? (
          <ul>
            {detail.tanques.map((tanque) => (
              <li key={tanque.id_tanque ?? tanque.nome_tanque}>
                <strong>{tanque.nome_tanque ?? `Tanque #${tanque.id_tanque ?? 'n/i'}`}</strong>
                <span>Metricas retornadas pela API: {tanque.metrics ? 'disponiveis' : 'pendentes'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum tanque relacionado retornado.</p>
        )}
      </article>

      <div className={styles.relatedGrid}>
        <HistoricoAlarmesPanel alarmes={detail.alarmes} error={alarmesError} />
        <HistoricoEventosPanel eventos={detail.eventos} error={eventosError} />
      </div>

      <footer className={styles.footer}>
        <span>Relatorios vinculados: {relatoriosError ? 'indisponivel' : detail.relatorios.length}</span>
        {permissions.canGenerateHistoricoReport ? (
          <button type="button" onClick={() => onGenerateReport(processo)}>
            <FilePlus2 size={15} aria-hidden="true" />
            Gerar relatorio
          </button>
        ) : null}
      </footer>
    </section>
  );
}
