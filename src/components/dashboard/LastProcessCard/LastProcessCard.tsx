import { CheckCircle2, Clock, Gauge } from 'lucide-react';
import type { HistoricoProcessoResponse } from '../../../types';
import {
  formatDateTime,
  getOptionalNumber,
  getProcessStatusLabel,
  getProcessStatusTone,
} from '../dashboard.utils';
import { StatusBadge } from '../StatusBadge';
import styles from './LastProcessCard.module.scss';

type LastProcessCardProps = {
  process: HistoricoProcessoResponse | null;
  partialError?: string;
};

export function LastProcessCard({ process, partialError }: LastProcessCardProps) {
  if (!process) {
    return (
      <article className={styles.card}>
        <header className={styles.header}>
          <div>
            <p className={styles.overline}>Ultimo processo</p>
            <h2>Nenhum processo recente encontrado</h2>
          </div>
          <StatusBadge label="Empty state" tone="neutral" />
        </header>
        <p className={styles.empty}>
          O endpoint de historico foi consultado, mas nao retornou processo finalizado recente para
          exibicao inicial.
        </p>
        {partialError ? <p className={styles.partialError}>{partialError}</p> : null}
      </article>
    );
  }

  const averageVacuum = getOptionalNumber(process, 'vacuo_medio');
  const finalVacuum = getOptionalNumber(process, 'vacuo_final');
  const efficiency = getOptionalNumber(process, 'eficiencia');
  const alarmsCount = getOptionalNumber(process, 'quantidade_alarmes');
  const hasVacuumValue = averageVacuum !== null || finalVacuum !== null;

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Ultimo processo</p>
          <h2>{process.nome_processo ?? `Processo #${process.id_processo}`}</h2>
        </div>
        <StatusBadge
          label={getProcessStatusLabel(process.status_processo)}
          tone={getProcessStatusTone(process.status_processo)}
        />
      </header>

      {partialError ? <p className={styles.partialError}>{partialError}</p> : null}

      <dl className={styles.metrics}>
        <div>
          <dt>
            <Clock size={15} aria-hidden="true" />
            Inicio
          </dt>
          <dd>{formatDateTime(process.iniciado_em)}</dd>
        </div>
        <div>
          <dt>
            <CheckCircle2 size={15} aria-hidden="true" />
            Fim
          </dt>
          <dd>{formatDateTime(process.finalizado_em)}</dd>
        </div>
        <div>
          <dt>
            <Gauge size={15} aria-hidden="true" />
            Vacuo medio/final
          </dt>
          <dd>
            {hasVacuumValue
              ? `${averageVacuum ?? 'n/i'} / ${finalVacuum ?? 'n/i'}`
              : 'Nao informado'}
          </dd>
        </div>
        <div>
          <dt>Indicadores</dt>
          <dd>
            Eficiencia {efficiency ?? 'n/i'} / Alarmes {alarmsCount ?? 'n/i'}
          </dd>
        </div>
      </dl>
    </article>
  );
}
