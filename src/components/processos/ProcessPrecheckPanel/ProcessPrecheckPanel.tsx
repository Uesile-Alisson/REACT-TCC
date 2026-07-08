import { motion } from 'framer-motion';
import { AlertTriangle, Clock3, Play, RefreshCw, ShieldCheck, Wrench } from 'lucide-react';
import type {
  ProcessoPrecheckGrupo,
  ProcessoPrecheckItem,
  ProcessoPrecheckResponse,
  ProcessoPrecheckStatus,
  ProcessoValvulaResumo,
  StatusProcesso,
} from '../../../types';
import { formatProcessDate } from '../processos.utils';
import styles from './ProcessPrecheckPanel.module.scss';

type ResourceReference = {
  id: number;
  label: string;
  status?: string;
  message?: unknown;
};

type ProcessPrecheckPanelProps = {
  precheck: ProcessoPrecheckResponse | null;
  valves: ProcessoValvulaResumo[];
  tanks: ResourceReference[];
  sensors: ResourceReference[];
  processStatus?: StatusProcesso;
  hasProcess: boolean;
  isLoading: boolean;
  loadingAction: string | null;
  error: string | null;
  feedback: string | null;
  socketFeedback: string | null;
  canStartProcess?: boolean;
  isStartingProcess?: boolean;
  startBlockedMessage?: string | null;
  onRefresh: () => void;
  onExecute: () => void;
  onStartProcess?: () => void;
  onValidateTank: (idTanque: number) => void;
  onValidateSensor: (idSensor: number) => void;
  onValidateValve: (idValvula: number) => void;
  onOpenValve: (idValvula: number) => void;
  onCloseValve: (idValvula: number) => void;
  onClearFeedback: () => void;
};

const GROUP_LABELS: Record<ProcessoPrecheckGrupo, string> = {
  USUARIO: 'Usuario',
  PROCESSO: 'Processo',
  TANQUES: 'Tanques',
  ACOPLAMENTO: 'Acoplamento',
  SENSORES: 'Sensores',
  VALVULAS: 'Valvulas',
  BOMBAS: 'Bombas',
  MQTT: 'MQTT',
  ESP32: 'ESP32',
  SOCKET: 'Socket.IO',
  LOGS: 'Logs',
};

const STATUS_LABELS: Record<ProcessoPrecheckStatus, string> = {
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
  PENDENTE: 'Pendente',
  FALHA: 'Falha',
  NAO_SUPORTADO: 'Nao suportado',
  NAO_CONFIRMADO: 'Nao confirmado',
  IGNORADO: 'Ignorado',
};

function getGroupKey(group?: ProcessoPrecheckGrupo | string | null): ProcessoPrecheckGrupo {
  return typeof group === 'string' && group in GROUP_LABELS
    ? (group as ProcessoPrecheckGrupo)
    : 'PROCESSO';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatDisplayValue(value: unknown, fallback = 'Nao informado'): string {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (isRecord(value)) {
    const name = value.nome ?? value.nome_tanque ?? value.nome_bomba ?? value.descricao ?? value.label;
    const id = value.id ?? value.id_tanque ?? value.id_bomba ?? value.id_sensor ?? value.id_valvula;

    if (name && id) {
      return `${String(name)} (#${String(id)})`;
    }

    if (name) {
      return String(name);
    }

    if (id) {
      return `#${String(id)}`;
    }
  }

  return fallback;
}

function isMeaningfulValue(value: unknown): boolean {
  return formatDisplayValue(value, '').trim().length > 0;
}

function getStatusLabel(status?: ProcessoPrecheckStatus | string | null): string {
  return typeof status === 'string' && status in STATUS_LABELS
    ? STATUS_LABELS[status as ProcessoPrecheckStatus]
    : formatDisplayValue(status);
}

function getStatusTone(status?: ProcessoPrecheckStatus | string | null): string {
  if (status === 'APROVADO') {
    return styles.success;
  }

  if (status === 'REPROVADO' || status === 'FALHA') {
    return styles.danger;
  }

  if (status === 'NAO_CONFIRMADO' || status === 'NAO_SUPORTADO') {
    return styles.warning;
  }

  return styles.neutral;
}

function isPrecheckExpired(precheck: ProcessoPrecheckResponse | null): boolean {
  if (!precheck?.executado_em || !precheck.validade_segundos) {
    return false;
  }

  const executedAt = new Date(precheck.executado_em).getTime();

  if (Number.isNaN(executedAt)) {
    return false;
  }

  return Date.now() - executedAt > precheck.validade_segundos * 1000;
}

function groupItems(items: ProcessoPrecheckItem[]): Array<[ProcessoPrecheckGrupo, ProcessoPrecheckItem[]]> {
  const groupedItems = new Map<ProcessoPrecheckGrupo, ProcessoPrecheckItem[]>();

  items.forEach((item) => {
    const group = getGroupKey(item.grupo);

    groupedItems.set(group, [...(groupedItems.get(group) ?? []), item]);
  });

  return Array.from(groupedItems.entries());
}

function formatDetails(details: ProcessoPrecheckItem['detalhes']): string | null {
  if (!details) {
    return null;
  }

  if (typeof details === 'string') {
    return details;
  }

  return Object.entries(details)
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${formatDisplayValue(value)}`)
    .join(' | ');
}

function getValveLabel(valve: ProcessoValvulaResumo): string {
  return formatDisplayValue(
    valve.nome_valvula ?? valve.nome ?? valve.codigo_hardware,
    `Valvula #${valve.id_valvula}`,
  );
}

function getValveRelation(value?: number | string | null, fallback?: unknown): string {
  const formattedFallback = formatDisplayValue(fallback, '');

  if (formattedFallback) {
    return formattedFallback;
  }

  return value ? `#${value}` : 'Nao vinculado';
}

function getValveTypeLabel(valve: ProcessoValvulaResumo): string {
  if (valve.tipo === 'PRINCIPAL') {
    return 'Linha principal';
  }

  if (valve.tipo === 'AUXILIAR') {
    return 'Linha auxiliar';
  }

  return 'Linha nao classificada';
}

function StatusBadge({ status }: { status?: ProcessoPrecheckStatus | string | null }) {
  return <span className={`${styles.badge} ${getStatusTone(status)}`}>{getStatusLabel(status)}</span>;
}

export function ProcessPrecheckPanel({
  precheck,
  valves,
  tanks,
  sensors,
  processStatus,
  hasProcess,
  isLoading,
  loadingAction,
  error,
  feedback,
  socketFeedback,
  canStartProcess = false,
  isStartingProcess = false,
  startBlockedMessage,
  onRefresh,
  onExecute,
  onStartProcess,
  onValidateTank,
  onValidateSensor,
  onValidateValve,
  onOpenValve,
  onCloseValve,
  onClearFeedback,
}: ProcessPrecheckPanelProps) {
  const expired = isPrecheckExpired(precheck);
  const blockingFailures =
    precheck?.falhas_bloqueantes?.filter((failure) => isMeaningfulValue(failure.mensagem)) ?? [];
  const warnings = precheck?.avisos?.map((item) => item.mensagem).filter(isMeaningfulValue) ?? [];
  const recommendations =
    precheck?.recomendacoes?.map((item) => item.mensagem).filter(isMeaningfulValue) ?? [];
  const hasBlockingFailures = blockingFailures.length > 0;
  const hasNotices = warnings.length > 0 || recommendations.length > 0;
  const canOpenCloseValves = processStatus === 'EM_EXECUCAO';
  const canStartAfterPrecheck = Boolean(
    precheck?.aprovado &&
      !precheck.bloqueado &&
      !expired &&
      canStartProcess &&
      onStartProcess,
  );

  return (
    <motion.section
      className={styles.panel}
      initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Pre-checagem operacional"
    >
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Seguranca operacional</p>
          <h2>Pre-checagem operacional</h2>
          <p>
            Consulte o estado real do backend antes de iniciar o processo. Pendencias de hardware
            nao sao tratadas como sucesso.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onRefresh} disabled={Boolean(loadingAction)}>
            <RefreshCw size={15} aria-hidden="true" />
            {loadingAction === 'refresh' ? 'Atualizando' : 'Atualizar estado'}
          </button>
          <button className={styles.primaryButton} type="button" onClick={onExecute} disabled={Boolean(loadingAction)}>
            <ShieldCheck size={15} aria-hidden="true" />
            {loadingAction === 'execute' ? 'Executando' : 'Executar pre-checagem'}
          </button>
        </div>
      </header>

      {isLoading ? <p className={styles.loading}>Carregando pre-checagem operacional...</p> : null}

      {!hasProcess ? (
        <section className={styles.emptyState}>
          <Clock3 size={18} aria-hidden="true" />
          <div>
            <strong>Sem processo selecionado.</strong>
            <span>Selecione um processo na listagem para consultar a pre-checagem operacional.</span>
          </div>
        </section>
      ) : null}

      {error ? (
        <section className={styles.errorState} role="alert">
          <strong>Falha na pre-checagem.</strong>
          <span>{error}</span>
          <button type="button" onClick={onClearFeedback}>Dispensar</button>
        </section>
      ) : null}

      {feedback || socketFeedback ? (
        <section className={styles.infoState} role="status">
          <strong>{feedback ?? socketFeedback}</strong>
          <button type="button" onClick={onClearFeedback}>Dispensar</button>
        </section>
      ) : null}

      {hasProcess && !isLoading && !precheck ? (
        <section className={styles.emptyState}>
          <Clock3 size={18} aria-hidden="true" />
          <div>
            <strong>Pre-checagem nunca executada ou nao carregada.</strong>
            <span>Use Atualizar estado para consultar sem acionar hardware, ou execute a pre-checagem real.</span>
          </div>
        </section>
      ) : null}

      {precheck ? (
        <>
          <div className={styles.summaryGrid}>
            <article>
              <span>Status geral</span>
              <strong>{getStatusLabel(precheck.status_geral)}</strong>
              <StatusBadge status={precheck.status_geral} />
            </article>
            <article>
              <span>Resultado</span>
              <strong>{precheck.aprovado ? 'Aprovado' : 'Nao aprovado'}</strong>
              <small>{precheck.bloqueado ? 'Bloqueado pelo backend' : 'Sem bloqueio retornado'}</small>
            </article>
            <article>
              <span>Ultima execucao</span>
              <strong>{formatProcessDate(precheck.executado_em)}</strong>
              <small>{precheck.validade_segundos ? `${precheck.validade_segundos}s de validade` : 'Validade nao informada'}</small>
            </article>
            <article className={expired ? styles.expiredCard : ''}>
              <span>Vencimento</span>
              <strong>{expired ? 'Vencida' : 'Dentro da janela'}</strong>
              <small>{expired ? 'Execute novamente antes de iniciar.' : 'Backend continua sendo autoridade.'}</small>
            </article>
          </div>

          {canStartAfterPrecheck ? (
            <section className={styles.startPanel} role="status">
              <div>
                <strong>Pre-checagem aprovada</strong>
                <span>O processo esta pronto para iniciar com validacao final do backend.</span>
              </div>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={onStartProcess}
                disabled={isStartingProcess || Boolean(startBlockedMessage)}
                title={startBlockedMessage ?? undefined}
              >
                <Play size={15} aria-hidden="true" />
                {isStartingProcess ? 'Iniciando' : 'Iniciar processo'}
              </button>
            </section>
          ) : null}

          {hasBlockingFailures ? (
            <section className={styles.blockingState}>
              <AlertTriangle size={18} aria-hidden="true" />
              <div>
                <strong>Falhas bloqueantes</strong>
                <ul>
                  {blockingFailures.map((failure, index) => (
                    <li key={`${formatDisplayValue(failure.codigo ?? failure.mensagem)}-${index}`}>
                      {formatDisplayValue(failure.mensagem)}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          {hasNotices ? (
            <div className={styles.noticeGrid}>
              <NoticeList title="Avisos" items={warnings} />
              <NoticeList title="Recomendacoes" items={recommendations} />
            </div>
          ) : null}

          <section className={styles.groupList}>
            {groupItems(precheck.itens).map(([group, items]) => (
              <article key={group} className={styles.groupCard}>
                <h3>{GROUP_LABELS[group] ?? group}</h3>
                <ul>
                  {items.map((item, index) => (
                    <li key={`${item.codigo ?? item.titulo ?? 'item'}-${index}`}>
                      <div>
                        <strong>{formatDisplayValue(item.titulo, 'Item de pre-checagem')}</strong>
                        <span>{formatDisplayValue(item.mensagem, 'Sem mensagem adicional.')}</span>
                        {item.evidencia ? <small>Evidencia: {formatDisplayValue(item.evidencia)}</small> : null}
                        {formatDetails(item.detalhes) ? <small>{formatDetails(item.detalhes)}</small> : null}
                        {item.timestamp ? <small>{formatProcessDate(item.timestamp)}</small> : null}
                      </div>
                      <div className={styles.itemMeta}>
                        <StatusBadge status={item.status} />
                        {item.obrigatorio ? <span>Obrigatorio</span> : null}
                        {item.bloqueante ? <span className={styles.blockingTag}>Bloqueante</span> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        </>
      ) : null}

      <section className={styles.validationGrid}>
        <ResourceCard
          title="Acoplamento por tanque"
          emptyText="Nenhum tanque retornado pelo checklist."
          resources={tanks}
          loadingAction={loadingAction}
          actionPrefix="tank"
          buttonLabel="Validar acoplamento"
          onAction={onValidateTank}
        />
        <ResourceCard
          title="Sensores"
          emptyText="Nenhum sensor retornado pelo checklist."
          resources={sensors}
          loadingAction={loadingAction}
          actionPrefix="sensor"
          buttonLabel="Validar"
          onAction={onValidateSensor}
        />
      </section>

      <section className={styles.valves}>
        <header>
          <div>
            <Wrench size={16} aria-hidden="true" />
            <strong>Valvulas vinculadas ao processo</strong>
          </div>
          <span>{valves.length} item(ns)</span>
        </header>

        {valves.length > 0 ? (
          <div className={styles.valveList}>
            {valves.map((valve) => {
              const canValidate = valve.pode_validar !== false;
              const canCommand = canOpenCloseValves && valve.pode_abrir_fechar !== false;

              return (
                <article key={valve.id_valvula}>
                  <div>
                    <strong>{getValveLabel(valve)}</strong>
                    <span>{getValveTypeLabel(valve)} / ID #{valve.id_valvula}</span>
                    <small>Codigo: {formatDisplayValue(valve.codigo_hardware, 'Nao informado')}</small>
                    <small>Tanque {getValveRelation(valve.tanque_codigo_hardware ?? valve.id_tanque, valve.tanque)}</small>
                    <small>Bomba {getValveRelation(valve.bomba_codigo_hardware ?? valve.id_bomba, valve.bomba)}</small>
                    <small>
                      Estado fisico:{' '}
                      {typeof valve.aberta === 'boolean' ? (valve.aberta ? 'Aberta' : 'Fechada') : 'Sem status'} /
                      {' '}
                      {typeof valve.disponivel === 'boolean'
                        ? valve.disponivel ? 'Disponivel' : 'Indisponivel'
                        : 'Sem status'}
                    </small>
                    <small>Ultimo acionamento: {formatProcessDate(valve.ultimo_acionamento)}</small>
                  </div>
                  <div className={styles.valveStatus}>
                    <StatusBadge status={String(valve.status_atual ?? valve.status_valvula ?? 'PENDENTE')} />
                    <button
                      type="button"
                      disabled={!canValidate || Boolean(loadingAction)}
                      onClick={() => onValidateValve(valve.id_valvula)}
                    >
                      {loadingAction === `valve-validate-${valve.id_valvula}` ? 'Validando' : 'Validar'}
                    </button>
                    <button
                      type="button"
                      disabled={!canCommand || Boolean(loadingAction)}
                      title={canCommand ? undefined : 'Disponivel apenas durante processo ativo.'}
                      onClick={() => onOpenValve(valve.id_valvula)}
                    >
                      {loadingAction === `valve-open-${valve.id_valvula}` ? 'Abrindo' : 'Abrir'}
                    </button>
                    <button
                      type="button"
                      disabled={!canCommand || Boolean(loadingAction)}
                      title={canCommand ? undefined : 'Disponivel apenas durante processo ativo.'}
                      onClick={() => onCloseValve(valve.id_valvula)}
                    >
                      {loadingAction === `valve-close-${valve.id_valvula}` ? 'Fechando' : 'Fechar'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className={styles.emptyInline}>Nenhuma valvula vinculada foi retornada pelo endpoint do processo.</p>
        )}
      </section>
    </motion.section>
  );
}

function NoticeList({ title, items }: { title: string; items: unknown[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <article>
      <h3>{title}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={`${formatDisplayValue(item)}-${index}`}>{formatDisplayValue(item)}</li>
        ))}
      </ul>
    </article>
  );
}

function ResourceCard({
  title,
  emptyText,
  resources,
  loadingAction,
  actionPrefix,
  buttonLabel,
  onAction,
}: {
  title: string;
  emptyText: string;
  resources: ResourceReference[];
  loadingAction: string | null;
  actionPrefix: 'tank' | 'sensor';
  buttonLabel: string;
  onAction: (id: number) => void;
}) {
  return (
    <article className={styles.resourceCard}>
      <h3>{title}</h3>
      {resources.length > 0 ? (
        <ul>
          {resources.map((resource) => (
            <li key={resource.id}>
              <div>
                <strong>{resource.label}</strong>
                <span>#{resource.id}</span>
                {resource.message ? <small>{formatDisplayValue(resource.message)}</small> : null}
              </div>
              <div className={styles.itemMeta}>
                <StatusBadge status={resource.status} />
                <button
                  type="button"
                  disabled={Boolean(loadingAction)}
                  onClick={() => onAction(resource.id)}
                >
                  {loadingAction === `${actionPrefix}-${resource.id}` ? 'Validando' : buttonLabel}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyInline}>{emptyText}</p>
      )}
    </article>
  );
}
