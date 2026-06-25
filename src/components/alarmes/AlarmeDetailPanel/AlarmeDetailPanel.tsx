import { ExternalLink, Wrench } from 'lucide-react';
import type { AlarmeResponse, AlarmesPermissions } from '../../../types';
import { formatAlarmeDate, getUnknownNumber, getUnknownString } from '../alarmes.utils';
import { AlarmeSeverityBadge } from '../AlarmeSeverityBadge';
import { AlarmeStatusBadge } from '../AlarmeStatusBadge';
import styles from './AlarmeDetailPanel.module.scss';

type AlarmeDetailPanelProps = {
  alarme: AlarmeResponse | null;
  isLoading: boolean;
  error?: string;
  permissions: AlarmesPermissions;
  onResolve: (alarme: AlarmeResponse) => void;
};

export function AlarmeDetailPanel({
  alarme,
  isLoading,
  error,
  permissions,
  onResolve,
}: AlarmeDetailPanelProps) {
  if (isLoading) {
    return <section className={styles.panel}>Carregando detalhe do alarme...</section>;
  }

  if (error) {
    return (
      <section className={styles.panel}>
        <p className={styles.error}>{error}</p>
      </section>
    );
  }

  if (!alarme) {
    return (
      <section className={styles.panel}>
        <p className={styles.empty}>Selecione um alarme para visualizar os detalhes.</p>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Detalhe do alarme</p>
          <h2>{alarme.tipo_alarme ?? `Alarme #${alarme.id_alarme}`}</h2>
        </div>
        <div className={styles.badges}>
          <AlarmeSeverityBadge severity={alarme.severidade} />
          <AlarmeStatusBadge status={alarme.status_alarme} />
        </div>
      </header>

      <p className={styles.message}>{alarme.mensagem ?? 'Sem mensagem registrada.'}</p>

      <dl className={styles.grid}>
        <div>
          <dt>ID</dt>
          <dd>{alarme.id_alarme}</dd>
        </div>
        <div>
          <dt>Origem</dt>
          <dd>{alarme.origem_alarme ?? 'Nao informado'}</dd>
        </div>
        <div>
          <dt>Processo</dt>
          <dd>{getUnknownNumber(alarme, 'id_processo')}</dd>
        </div>
        <div>
          <dt>Tanque</dt>
          <dd>{getUnknownNumber(alarme, 'id_tanque')}</dd>
        </div>
        <div>
          <dt>Sensor</dt>
          <dd>{getUnknownNumber(alarme, 'id_sensor')}</dd>
        </div>
        <div>
          <dt>Criado em</dt>
          <dd>{formatAlarmeDate(alarme.criado_em)}</dd>
        </div>
        <div>
          <dt>Resolvido em</dt>
          <dd>{formatAlarmeDate(alarme.resolvido_em)}</dd>
        </div>
        <div>
          <dt>Responsavel</dt>
          <dd>{getUnknownString(alarme, 'resolvido_por')}</dd>
        </div>
      </dl>

      <footer className={styles.actions}>
        {typeof alarme.id_processo === 'number' ? (
          <a href="/processos">
            <ExternalLink size={15} aria-hidden="true" />
            Ver processos
          </a>
        ) : null}
        {permissions.canResolveAlarme(alarme.status_alarme) ? (
          <button type="button" onClick={() => onResolve(alarme)}>
            <Wrench size={15} aria-hidden="true" />
            Resolver alarme
          </button>
        ) : null}
      </footer>
    </section>
  );
}
