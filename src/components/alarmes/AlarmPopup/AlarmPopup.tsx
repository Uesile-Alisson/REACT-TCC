import { motion } from 'framer-motion';
import { AlertTriangle, BellRing, CheckCircle2, ExternalLink, ShieldAlert, Wrench, X } from 'lucide-react';
import type { AlarmeResponse, AlarmesPermissions } from '../../../types';
import { formatAlarmeDate, getSeverityLabel, getStatusLabel } from '../alarmes.utils';
import styles from './AlarmPopup.module.scss';

type AlarmPopupCounts = {
  critical: number;
  medium: number;
  info: number;
};

type AlarmPopupProps = {
  alarm: AlarmeResponse;
  counts: AlarmPopupCounts;
  permissions: AlarmesPermissions;
  feedback: string | null;
  error: string | null;
  isAcknowledging: boolean;
  isResolving: boolean;
  onViewDetails: (alarm: AlarmeResponse) => void;
  onViewAll: () => void;
  onClose?: () => void;
  onAcknowledge: (alarm: AlarmeResponse) => void;
  onResolve: (alarm: AlarmeResponse) => void;
};

function getAlarmTitle(alarm: AlarmeResponse): string {
  return alarm.titulo ?? alarm.tipo_alarme ?? `Alarme #${alarm.id_alarme}`;
}

function getAlarmDescription(alarm: AlarmeResponse): string {
  return alarm.descricao ?? alarm.mensagem ?? 'Alarme operacional ativo aguardando normalizacao tecnica.';
}

function getRelatedLabel(alarm: AlarmeResponse): string {
  const parts = [
    alarm.processo?.nome_processo ?? (typeof alarm.id_processo === 'number' ? `Processo #${alarm.id_processo}` : null),
    alarm.processo_tanque?.nome_tanque ?? (typeof alarm.id_processo_tanque === 'number' ? `Tanque #${alarm.id_processo_tanque}` : null),
    alarm.processo_tanque_sensor?.nome_sensor ??
      (typeof alarm.id_processo_tanque_sensor === 'number'
        ? `Sensor #${alarm.id_processo_tanque_sensor}`
        : null),
  ].filter((part): part is string => typeof part === 'string' && part.trim().length > 0);

  return parts.length > 0 ? parts.join(' / ') : 'Sem vinculo operacional informado';
}

function getRecommendedAction(alarm: AlarmeResponse): string {
  if (alarm.bloqueante) {
    return 'Falha bloqueante: valide o equipamento antes de prosseguir.';
  }

  if (alarm.requer_intervencao) {
    return 'Requer intervencao tecnica para normalizacao.';
  }

  if (alarm.recuperacao_automatica) {
    return 'Recuperacao automatica em acompanhamento pelo backend.';
  }

  return 'Acompanhe a leitura e aguarde normalizacao tecnica.';
}

function getCounterText(counts: AlarmPopupCounts): string {
  const parts = [
    counts.critical > 0 ? `${counts.critical} alarme${counts.critical > 1 ? 's' : ''} critico${counts.critical > 1 ? 's' : ''} ativo${counts.critical > 1 ? 's' : ''}` : null,
    counts.medium > 0 ? `${counts.medium} alarme${counts.medium > 1 ? 's' : ''} medio${counts.medium > 1 ? 's' : ''} ativo${counts.medium > 1 ? 's' : ''}` : null,
    counts.info > 0 ? `${counts.info} informativo${counts.info > 1 ? 's' : ''} ativo${counts.info > 1 ? 's' : ''}` : null,
  ].filter((part): part is string => Boolean(part));

  return parts.join(' / ');
}

function getPopupToneClass(alarm: AlarmeResponse): string {
  if (alarm.severidade === 'CRITICO') {
    return styles.critical;
  }

  if (alarm.severidade === 'INFO') {
    return styles.info;
  }

  return styles.medium;
}

function getPopupHeading(alarm: AlarmeResponse): string {
  if (alarm.severidade === 'CRITICO') {
    return 'Alarme critico ativo';
  }

  if (alarm.severidade === 'INFO') {
    return 'Alarme informativo ativo';
  }

  return 'Alarme medio ativo';
}

export function AlarmPopup({
  alarm,
  counts,
  permissions,
  feedback,
  error,
  isAcknowledging,
  isResolving,
  onViewDetails,
  onViewAll,
  onClose,
  onAcknowledge,
  onResolve,
}: AlarmPopupProps) {
  const isCritical = alarm.severidade === 'CRITICO';
  const canResolve = permissions.canResolveAlarme(alarm.status_alarme);
  const counterText = getCounterText(counts);

  return (
    <motion.aside
      className={`${styles.popup} ${getPopupToneClass(alarm)}`}
      role="status"
      aria-live={isCritical ? 'assertive' : 'polite'}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          {isCritical ? <ShieldAlert size={22} /> : <AlertTriangle size={22} />}
        </span>
        <div>
          <p>{getPopupHeading(alarm)}</p>
          <strong>{getAlarmTitle(alarm)}</strong>
        </div>
        {onClose ? (
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={alarm.severidade === 'INFO' ? 'Fechar aviso informativo' : 'Ocultar popup deste alarme'}
            title={alarm.severidade === 'INFO' ? 'Fechar' : 'Ocultar temporariamente'}
          >
            <X size={17} aria-hidden="true" />
          </button>
        ) : null}
      </header>

      <p className={styles.description}>{getAlarmDescription(alarm)}</p>

      <dl className={styles.meta}>
        <div>
          <dt>Severidade</dt>
          <dd>{getSeverityLabel(alarm.severidade)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{getStatusLabel(alarm.status_alarme)}</dd>
        </div>
        <div>
          <dt>Tipo</dt>
          <dd>{alarm.tipo_alarme ?? 'Nao informado'}</dd>
        </div>
        <div>
          <dt>Ocorrido</dt>
          <dd>{formatAlarmeDate(alarm.ocorrido_em ?? alarm.criado_em)}</dd>
        </div>
        <div className={styles.wide}>
          <dt>Relacionado</dt>
          <dd>{getRelatedLabel(alarm)}</dd>
        </div>
        <div className={styles.wide}>
          <dt>Recuperacao</dt>
          <dd>
            {alarm.recuperacao_automatica ? 'Automatica' : 'Manual'} / tentativas:{' '}
            {alarm.tentativas_recuperacao ?? 0}
          </dd>
        </div>
      </dl>

      <div className={styles.flags} aria-label="Regras operacionais do alarme">
        {alarm.bloqueante ? <span>Bloqueante</span> : null}
        {alarm.requer_intervencao ? <span>Intervencao</span> : null}
        {alarm.recuperacao_automatica ? <span>Recuperacao auto</span> : null}
      </div>

      <p className={styles.recommendation}>
        <BellRing size={15} aria-hidden="true" />
        {getRecommendedAction(alarm)}
      </p>

      {counterText ? <p className={styles.counter}>{counterText}</p> : null}
      {feedback ? (
        <p className={styles.feedback}>
          <CheckCircle2 size={15} aria-hidden="true" />
          {feedback}
        </p>
      ) : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      <footer className={styles.actions}>
        <button type="button" onClick={() => onViewDetails(alarm)}>
          <ExternalLink size={15} aria-hidden="true" />
          Ver detalhes
        </button>
        <button type="button" onClick={onViewAll}>
          Ver todos
        </button>
        {permissions.canAcknowledgeAlarme ? (
          <button
            type="button"
            onClick={() => onAcknowledge(alarm)}
            disabled={isAcknowledging}
          >
            {isAcknowledging ? 'Registrando' : 'Reconhecer'}
          </button>
        ) : null}
        {canResolve ? (
          <button
            type="button"
            className={styles.resolveButton}
            onClick={() => onResolve(alarm)}
            disabled={isResolving}
          >
            <Wrench size={15} aria-hidden="true" />
            {isResolving ? 'Resolvendo' : 'Resolver'}
          </button>
        ) : null}
      </footer>
    </motion.aside>
  );
}
