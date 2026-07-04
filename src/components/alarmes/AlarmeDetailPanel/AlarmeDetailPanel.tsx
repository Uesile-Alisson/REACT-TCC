import { CheckCheck, ExternalLink, FilePlus2, Wrench } from 'lucide-react';
import type { AlarmeResponse, AlarmesPermissions } from '../../../types';
import { formatAlarmeDate, getUnknownNumber, getUnknownString } from '../alarmes.utils';
import { AlarmeSeverityBadge } from '../AlarmeSeverityBadge';
import { AlarmeStatusBadge } from '../AlarmeStatusBadge';
import styles from './AlarmeDetailPanel.module.scss';

type AlarmeDetailPanelProps = {
  alarme: AlarmeResponse | null;
  isLoading: boolean;
  error?: string;
  generatingReportId: number | null;
  acknowledgingId: number | null;
  permissions: AlarmesPermissions;
  onAcknowledge: (alarme: AlarmeResponse) => void;
  onResolve: (alarme: AlarmeResponse) => void;
  onGenerateReport: (alarme: AlarmeResponse) => void;
};

export function AlarmeDetailPanel({
  alarme,
  isLoading,
  error,
  generatingReportId,
  acknowledgingId,
  permissions,
  onAcknowledge,
  onResolve,
  onGenerateReport,
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
          <h2>{alarme.titulo ?? alarme.tipo_alarme ?? `Alarme #${alarme.id_alarme}`}</h2>
        </div>
        <div className={styles.badges}>
          <AlarmeSeverityBadge severity={alarme.severidade} />
          <AlarmeStatusBadge status={alarme.status_alarme} />
        </div>
      </header>

      <p className={styles.message}>{alarme.descricao ?? alarme.mensagem ?? 'Sem mensagem registrada.'}</p>

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
          <dt>Status</dt>
          <dd>{alarme.status_alarme}</dd>
        </div>
        <div>
          <dt>Reconhecido</dt>
          <dd>{alarme.reconhecido ? 'Sim' : 'Nao'}</dd>
        </div>
        <div>
          <dt>Ultimo reconhecimento</dt>
          <dd>{formatAlarmeDate(alarme.ultimo_reconhecimento_em)}</dd>
        </div>
        <div>
          <dt>Processo</dt>
          <dd>{alarme.processo?.nome_processo ?? getUnknownNumber(alarme, 'id_processo')}</dd>
        </div>
        <div>
          <dt>Tanque</dt>
          <dd>{alarme.processo_tanque?.nome_tanque ?? getUnknownNumber(alarme, 'id_processo_tanque')}</dd>
        </div>
        <div>
          <dt>Sensor</dt>
          <dd>{alarme.processo_tanque_sensor?.nome_sensor ?? getUnknownNumber(alarme, 'id_processo_tanque_sensor')}</dd>
        </div>
        <div>
          <dt>Valor detectado</dt>
          <dd>
            {typeof alarme.valor_detectado === 'number'
              ? `${alarme.valor_detectado}${alarme.unidade ? ` ${alarme.unidade}` : ''}`
              : 'Nao informado'}
          </dd>
        </div>
        <div>
          <dt>Bloqueante</dt>
          <dd>{alarme.bloqueante ? 'Sim' : 'Nao'}</dd>
        </div>
        <div>
          <dt>Intervencao</dt>
          <dd>{alarme.requer_intervencao ? 'Sim' : 'Nao'}</dd>
        </div>
        <div>
          <dt>Recuperacao auto</dt>
          <dd>{alarme.recuperacao_automatica ? 'Sim' : 'Nao'}</dd>
        </div>
        <div>
          <dt>Tentativas recuperacao</dt>
          <dd>{alarme.tentativas_recuperacao ?? 0}</dd>
        </div>
        <div>
          <dt>Ocorrido em</dt>
          <dd>{formatAlarmeDate(alarme.ocorrido_em ?? alarme.criado_em)}</dd>
        </div>
        <div>
          <dt>Normalizado em</dt>
          <dd>{formatAlarmeDate(alarme.normalizado_em)}</dd>
        </div>
        <div>
          <dt>Resolvido em</dt>
          <dd>{formatAlarmeDate(alarme.resolvido_em)}</dd>
        </div>
        <div>
          <dt>Motivo resolucao</dt>
          <dd>{alarme.motivo_resolucao ?? 'Nao informado'}</dd>
        </div>
        <div>
          <dt>Responsavel</dt>
          <dd>{alarme.usuario_responsavel?.nome ?? getUnknownString(alarme, 'resolvido_por')}</dd>
        </div>
      </dl>

      <footer className={styles.actions}>
        {typeof alarme.id_processo === 'number' ? (
          <a href="/processos">
            <ExternalLink size={15} aria-hidden="true" />
            Ver processos
          </a>
        ) : null}
        {permissions.canAcknowledgeAlarme ? (
          <button
            type="button"
            onClick={() => onAcknowledge(alarme)}
            disabled={acknowledgingId === alarme.id_alarme}
          >
            <CheckCheck size={15} aria-hidden="true" />
            {acknowledgingId === alarme.id_alarme ? 'Registrando' : 'Reconhecer'}
          </button>
        ) : null}
        {permissions.canResolveAlarme(alarme.status_alarme) ? (
          <button type="button" onClick={() => onResolve(alarme)}>
            <Wrench size={15} aria-hidden="true" />
            Resolver alarme
          </button>
        ) : null}
        {permissions.canGenerateAlarmeReport ? (
          <button
            type="button"
            onClick={() => onGenerateReport(alarme)}
            disabled={generatingReportId === alarme.id_alarme}
          >
            <FilePlus2 size={15} aria-hidden="true" />
            {generatingReportId === alarme.id_alarme ? 'Gerando relatorio' : 'Gerar relatorio'}
          </button>
        ) : null}
      </footer>
    </section>
  );
}
