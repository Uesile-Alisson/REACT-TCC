import {
  Activity,
  AlertTriangle,
  Clock3,
  Gauge,
  ListOrdered,
  LockKeyhole,
  Power,
  PowerOff,
  RefreshCw,
  ShieldCheck,
  UnlockKeyhole,
} from 'lucide-react';
import { useState } from 'react';
import type {
  ProcessoAuxiliarControlHolder,
  ProcessoAuxiliarState,
  ProcessoAuxiliarTankState,
  ProcessoDashboardResponse,
  ProcessoDashboardTank,
  ProcessoGeneralClosureState,
} from '../../../types';
import type { ProcessOperationalAction } from '../../../hooks/useProcessOperationalState';
import { formatProcessDate, formatProcessNumber, type ProcessTone } from '../processos.utils';
import { ProcessStatusBadge } from '../ProcessStatusBadge';
import styles from './ProcessOperationalPanel.module.scss';

type ProcessOperationalPanelProps = {
  dashboard: ProcessoDashboardResponse | null;
  generalClosure: ProcessoGeneralClosureState | null;
  auxiliaryState: ProcessoAuxiliarState | null;
  currentUserId: number | null;
  canControlAuxiliary: boolean;
  canStartClosures: boolean;
  isLoading: boolean;
  actionLoading: ProcessOperationalAction | null;
  error: string | null;
  feedback: string | null;
  reason: string;
  leaseDuration: number;
  onReasonChange: (reason: string) => void;
  onLeaseDurationChange: (duration: number) => void;
  onRefresh: () => void;
  onClearFeedback: () => void;
  onAcquirePump: () => void;
  onReleasePump: () => void;
  onAcquireValve: (idProcessoTanque: number) => void;
  onReleaseValve: (idProcessoTanque: number) => void;
  onTurnOnPump: (idProcessoTanque: number) => void;
  onTurnOffPump: () => void;
  onOpenValve: (idProcessoTanque: number) => void;
  onCloseValve: (idProcessoTanque: number) => void;
  onStartTankClosure: (idProcessoTanque: number) => void;
  onFinalizeGeneralClosure: () => void;
};

const TANK_SLOT_COUNT = 3;

type PendingConfirmation = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
};

function humanizeStatus(value?: string | null): string {
  if (!value) {
    return 'Nao informado';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getOperationalTone(status?: string | null): ProcessTone {
  if (!status) {
    return 'neutral';
  }

  if (
    status.includes('FALHA') ||
    status.includes('BLOQUEADO') ||
    status.includes('ESTAGNADO') ||
    status.includes('INTERROMPIDO')
  ) {
    return 'danger';
  }

  if (status.includes('AGUARDANDO') || status.includes('SUSPEITA') || status.includes('PAUSADO')) {
    return 'warning';
  }

  if (
    status.includes('CONCLUIDO') ||
    status.includes('ESTABILIZADO') ||
    status.includes('ATINGIDO') ||
    status.includes('DISPONIVEL')
  ) {
    return 'success';
  }

  return status.includes('EXECUCAO') || status.includes('ATENDIMENTO') ? 'info' : 'neutral';
}

function isLeaseActive(holder: ProcessoAuxiliarControlHolder | null): boolean {
  if (!holder?.expira_em) {
    return false;
  }

  const expiresAt = new Date(holder.expira_em).getTime();

  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

function ownsLease(holder: ProcessoAuxiliarControlHolder | null, userId: number | null): boolean {
  return Boolean(userId && holder?.id_usuario === userId && isLeaseActive(holder));
}

function formatLease(holder: ProcessoAuxiliarControlHolder | null): string {
  if (!holder || !isLeaseActive(holder)) {
    return 'Automacao / livre';
  }

  return `${holder.nome} ate ${formatProcessDate(holder.expira_em)}`;
}

function formatBoolean(value: boolean | null): string {
  if (value === null) {
    return 'Sem telemetria';
  }

  return value ? 'Sim' : 'Nao';
}

function clampPercent(value: number | null): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(Math.max(value, 0), 100)
    : 0;
}

type TankCardProps = {
  slot: number;
  tank: ProcessoDashboardTank | null;
  auxiliaryTank: ProcessoAuxiliarTankState | null;
  currentUserId: number | null;
  canControlAuxiliary: boolean;
  canStartClosures: boolean;
  isManualControlMode: boolean;
  pumpOwnedByCurrentUser: boolean;
  actionLoading: ProcessOperationalAction | null;
  onAcquireValve: (idProcessoTanque: number) => void;
  onReleaseValve: (idProcessoTanque: number) => void;
  onTurnOnPump: (idProcessoTanque: number) => void;
  onOpenValve: (idProcessoTanque: number) => void;
  onCloseValve: (idProcessoTanque: number) => void;
  onStartTankClosure: (idProcessoTanque: number) => void;
};

function TankCard({
  slot,
  tank,
  auxiliaryTank,
  currentUserId,
  canControlAuxiliary,
  canStartClosures,
  isManualControlMode,
  pumpOwnedByCurrentUser,
  actionLoading,
  onAcquireValve,
  onReleaseValve,
  onTurnOnPump,
  onOpenValve,
  onCloseValve,
  onStartTankClosure,
}: TankCardProps) {
  if (!tank) {
    return (
      <article className={`${styles.tankCard} ${styles.unusedTank}`}>
        <span className={styles.slotLabel}>Posicao {slot}</span>
        <div>
          <Activity size={28} aria-hidden="true" />
          <h3>Tanque nao utilizado</h3>
          <p>Este processo nao possui um ciclo de tanque configurado nesta posicao.</p>
        </div>
      </article>
    );
  }

  const valveHolder = auxiliaryTank?.valvula_auxiliar?.controle ?? null;
  const valveOwnedByCurrentUser = ownsLease(valveHolder, currentUserId);
  const valveLeaseHeldByOther = isLeaseActive(valveHolder) && !valveOwnedByCurrentUser;
  const valveOpen = auxiliaryTank?.valvula_auxiliar?.status_valvula === 'ABERTA';
  const closureReady =
    tank.encerramento.pronto_para_encerrar && tank.encerramento.aguardando_acao_manual;
  const tankActionBusy = Boolean(actionLoading);
  const canIssueTankCommands =
    canControlAuxiliary && isManualControlMode && pumpOwnedByCurrentUser && valveOwnedByCurrentUser;
  const efficiency = clampPercent(tank.eficiencia);

  return (
    <article className={styles.tankCard}>
      <header className={styles.tankHeader}>
        <div>
          <span className={styles.slotLabel}>Posicao {slot} / Tanque #{tank.id_tanque}</span>
          <h3>{tank.nome_tanque}</h3>
        </div>
        <ProcessStatusBadge
          label={humanizeStatus(tank.status_tanque_processo)}
          tone={getOperationalTone(tank.status_tanque_processo)}
        />
      </header>

      <div className={styles.vacuumSummary}>
        <div>
          <span>Vacuo atual</span>
          <strong>{formatProcessNumber(tank.vacuo_atual, 'kPa')}</strong>
        </div>
        <div>
          <span>Alvo</span>
          <strong>{formatProcessNumber(tank.vacuo_alvo, 'kPa')}</strong>
        </div>
        <div>
          <span>Eficiencia</span>
          <strong>{formatProcessNumber(tank.eficiencia, '%')}</strong>
        </div>
      </div>

      <div className={styles.progressTrack} aria-label={`Eficiencia ${efficiency}%`}>
        <span style={{ width: `${efficiency}%` }} />
      </div>

      <dl className={styles.factGrid}>
        <div>
          <dt>Ultima leitura</dt>
          <dd>{formatProcessDate(tank.ultima_leitura_em)}</dd>
        </div>
        <div>
          <dt>Leituras / sensores</dt>
          <dd>{tank.total_leituras} / {tank.total_sensores}</dd>
        </div>
        <div>
          <dt>Vacuo atingido</dt>
          <dd>{formatBoolean(tank.vacuo_atingido)}</dd>
        </div>
        <div>
          <dt>Vacuo estabilizado</dt>
          <dd>{formatBoolean(tank.vacuo_estabilizado)}</dd>
        </div>
        <div>
          <dt>Versao do estado</dt>
          <dd>Lifecycle {tank.encerramento.versao} / Auxiliar {auxiliaryTank?.versao ?? '-'}</dd>
        </div>
      </dl>

      <section className={`${styles.stateBox} ${tank.estagnacao.detectada ? styles.dangerBox : ''}`}>
        <div className={styles.stateTitle}>
          {tank.estagnacao.detectada ? <AlertTriangle size={16} aria-hidden="true" /> : <Gauge size={16} aria-hidden="true" />}
          <strong>Progresso e estagnacao</strong>
          <ProcessStatusBadge
            label={humanizeStatus(tank.estagnacao.status)}
            tone={getOperationalTone(tank.estagnacao.status)}
          />
        </div>
        <p>{tank.estagnacao.mensagem}</p>
        <small>
          Variacao {formatProcessNumber(tank.estagnacao.variacao_vacuo, 'kPa')} em {tank.estagnacao.janela_segundos}s;
          {' '}{tank.estagnacao.leituras_janela}/{tank.estagnacao.leituras_minimas} leituras da janela.
        </small>
        {tank.estagnacao.evidencias.motivo_decisao ? (
          <small>Decisao: {tank.estagnacao.evidencias.motivo_decisao}</small>
        ) : null}
      </section>

      <section className={styles.stateBox}>
        <div className={styles.stateTitle}>
          <ShieldCheck size={16} aria-hidden="true" />
          <strong>Encerramento individual</strong>
          <ProcessStatusBadge
            label={humanizeStatus(tank.encerramento.status)}
            tone={getOperationalTone(tank.encerramento.status)}
          />
        </div>
        <dl className={styles.compactFacts}>
          <div><dt>Etapa</dt><dd>{humanizeStatus(tank.encerramento.etapa)}</dd></div>
          <div><dt>Retencao</dt><dd>{tank.encerramento.retencao.tempo_necessario_segundos}s</dd></div>
          <div><dt>Vacuo ao isolar</dt><dd>{formatProcessNumber(tank.encerramento.vacuo_isolamento, 'kPa')}</dd></div>
          <div><dt>Perda na retencao</dt><dd>{formatProcessNumber(tank.encerramento.perda_vacuo_retencao, 'kPa')}</dd></div>
          <div><dt>Pode desacoplar</dt><dd>{formatBoolean(tank.encerramento.pode_desacoplar)}</dd></div>
        </dl>
        {tank.encerramento.motivo_bloqueio ? (
          <p className={styles.inlineWarning}>{tank.encerramento.motivo_bloqueio}</p>
        ) : null}
        {canStartClosures && closureReady ? (
          <button
            type="button"
            className={styles.primaryAction}
            onClick={() => onStartTankClosure(tank.id_processo_tanque)}
            disabled={tankActionBusy}
          >
            <ShieldCheck size={15} aria-hidden="true" />
            Iniciar encerramento deste tanque
          </button>
        ) : null}
      </section>

      <section className={styles.stateBox}>
        <div className={styles.stateTitle}>
          <ListOrdered size={16} aria-hidden="true" />
          <strong>Subsistema auxiliar</strong>
          <ProcessStatusBadge
            label={humanizeStatus(auxiliaryTank?.status_auxilio)}
            tone={getOperationalTone(auxiliaryTank?.status_auxilio)}
          />
        </div>
        {auxiliaryTank ? (
          <>
            <dl className={styles.compactFacts}>
              <div><dt>Prioridade</dt><dd>{auxiliaryTank.prioridade || 'Padrao'}</dd></div>
              <div><dt>Posicao na fila</dt><dd>{auxiliaryTank.posicao_fila ?? 'Fora da fila'}</dd></div>
              <div><dt>Valvula</dt><dd>{humanizeStatus(auxiliaryTank.valvula_auxiliar?.status_valvula)}</dd></div>
              <div><dt>Controle da valvula</dt><dd>{formatLease(valveHolder)}</dd></div>
              <div>
                <dt>Melhoria observada</dt>
                <dd>{formatProcessNumber(auxiliaryTank.evidencias.melhoria_observada, 'kPa')}</dd>
              </div>
              <div>
                <dt>Eficacia confirmada</dt>
                <dd>{formatBoolean(auxiliaryTank.evidencias.eficacia_confirmada)}</dd>
              </div>
            </dl>
            {auxiliaryTank.evidencias.motivo ? <p>{auxiliaryTank.evidencias.motivo}</p> : null}
            {auxiliaryTank.motivo_bloqueio || auxiliaryTank.ultimo_erro ? (
              <p className={styles.inlineWarning}>
                {auxiliaryTank.motivo_bloqueio ?? auxiliaryTank.ultimo_erro}
              </p>
            ) : null}
          </>
        ) : (
          <p>Contrato auxiliar deste tanque ainda nao foi retornado.</p>
        )}

        {canControlAuxiliary && isManualControlMode && auxiliaryTank?.valvula_auxiliar ? (
          <div className={styles.actionGrid}>
            {!isLeaseActive(valveHolder) ? (
              <button
                type="button"
                onClick={() => onAcquireValve(tank.id_processo_tanque)}
                disabled={tankActionBusy}
              >
                <LockKeyhole size={14} aria-hidden="true" />
                Assumir valvula
              </button>
            ) : null}
            {valveOwnedByCurrentUser ? (
              <button
                type="button"
                onClick={() => onReleaseValve(tank.id_processo_tanque)}
                disabled={tankActionBusy}
              >
                <UnlockKeyhole size={14} aria-hidden="true" />
                Liberar valvula
              </button>
            ) : null}
            {valveOwnedByCurrentUser ? (
              <button
                type="button"
                onClick={() => (
                  valveOpen
                    ? onCloseValve(tank.id_processo_tanque)
                    : onOpenValve(tank.id_processo_tanque)
                )}
                disabled={tankActionBusy}
              >
                {valveOpen ? 'Fechar valvula' : 'Abrir valvula'}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onTurnOnPump(tank.id_processo_tanque)}
              disabled={!canIssueTankCommands || tankActionBusy}
              title={
                canIssueTankCommands
                  ? 'Liga a bomba auxiliar para este tanque.'
                  : 'Assuma os leases da bomba e da valvula antes de energizar.'
              }
            >
              <Power size={14} aria-hidden="true" />
              Ligar bomba para este tanque
            </button>
            {valveLeaseHeldByOther ? (
              <small>Valvula sob controle de outro usuario ate o fim do lease.</small>
            ) : null}
          </div>
        ) : null}
      </section>
    </article>
  );
}

export function ProcessOperationalPanel({
  dashboard,
  generalClosure,
  auxiliaryState,
  currentUserId,
  canControlAuxiliary,
  canStartClosures,
  isLoading,
  actionLoading,
  error,
  feedback,
  reason,
  leaseDuration,
  onReasonChange,
  onLeaseDurationChange,
  onRefresh,
  onClearFeedback,
  onAcquirePump,
  onReleasePump,
  onAcquireValve,
  onReleaseValve,
  onTurnOnPump,
  onTurnOffPump,
  onOpenValve,
  onCloseValve,
  onStartTankClosure,
  onFinalizeGeneralClosure,
}: ProcessOperationalPanelProps) {
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);

  function requestConfirmation(
    title: string,
    description: string,
    confirmLabel: string,
    action: () => void,
  ): void {
    setPendingConfirmation({ title, description, confirmLabel, onConfirm: action });
  }

  if (isLoading && !dashboard) {
    return <section className={styles.panel}>Carregando ciclo de vida individual dos tanques...</section>;
  }

  if (!dashboard) {
    return (
      <section className={styles.panel}>
        <p className={styles.emptyState}>O processo ativo ainda nao possui snapshot operacional disponivel.</p>
        {error ? <p className={styles.errorState}>{error}</p> : null}
      </section>
    );
  }

  const mode = auxiliaryState?.modo_operacao_auxiliar ?? dashboard.subsistema_auxiliar.modo_operacao_auxiliar;
  const auxiliary = auxiliaryState ?? dashboard.subsistema_auxiliar;
  const isManualControlMode = mode === 'ASSISTIDO' || mode === 'MANUAL';
  const pumpHolder = auxiliary.bomba_auxiliar?.controle ?? null;
  const pumpOwnedByCurrentUser = ownsLease(pumpHolder, currentUserId);
  const pumpLeaseHeldByOther = isLeaseActive(pumpHolder) && !pumpOwnedByCurrentUser;
  const pumpRunning = auxiliary.bomba_auxiliar?.ligada_hardware === true;
  const closure = generalClosure ?? dashboard.encerramento.geral;
  const canFinalizeClosure = closure.pronto_para_iniciar && closure.aguardando_acao_manual;
  const tankSlots = Array.from({ length: TANK_SLOT_COUNT }, (_, index) => dashboard.tanques[index] ?? null);

  return (
    <section className={styles.panel} aria-labelledby="operational-panel-title">
      <header className={styles.panelHeader}>
        <div>
          <p className={styles.overline}>Operacao em tempo real</p>
          <h2 id="operational-panel-title">Ciclo de vida por tanque</h2>
          <span>Snapshot {formatProcessDate(dashboard.snapshot_at)} · versoes usadas em cada comando.</span>
        </div>
        <button type="button" className={styles.refreshButton} onClick={onRefresh} disabled={isLoading}>
          <RefreshCw size={15} aria-hidden="true" />
          Atualizar
        </button>
      </header>

      {error ? (
        <div className={styles.errorState} role="alert">
          <strong>Operacao nao concluida.</strong>
          <span>{error}</span>
          <button type="button" onClick={onClearFeedback}>Dispensar</button>
        </div>
      ) : null}
      {feedback ? (
        <div className={styles.successState} role="status">
          <span>{feedback}</span>
          <button type="button" onClick={onClearFeedback}>Dispensar</button>
        </div>
      ) : null}

      <div className={styles.systemGrid}>
        <article className={styles.systemCard}>
          <div className={styles.stateTitle}>
            <Activity size={17} aria-hidden="true" />
            <strong>Modo e fila auxiliar</strong>
            <ProcessStatusBadge label={humanizeStatus(mode)} tone={mode === 'AUTOMATICO' ? 'info' : 'warning'} />
          </div>
          <dl className={styles.compactFacts}>
            <div><dt>Estado</dt><dd>{humanizeStatus(auxiliary.status_subsistema)}</dd></div>
            <div><dt>Versao</dt><dd>{auxiliary.versao}</dd></div>
            <div>
              <dt>Tanque atendido</dt>
              <dd>{auxiliary.tanque_em_atendimento?.nome_tanque ?? 'Nenhum'}</dd>
            </div>
            <div><dt>Atualizado</dt><dd>{formatProcessDate(auxiliary.atualizado_em)}</dd></div>
          </dl>
          {auxiliary.motivo_bloqueio || auxiliary.ultimo_erro ? (
            <p className={styles.inlineWarning}>{auxiliary.motivo_bloqueio ?? auxiliary.ultimo_erro}</p>
          ) : null}
          <p className={styles.contractNote}>
            Este modo governa o subsistema auxiliar. O lifecycle principal e o encerramento possuem contratos separados.
          </p>
        </article>

        <article className={styles.systemCard}>
          <div className={styles.stateTitle}>
            <Power size={17} aria-hidden="true" />
            <strong>Bomba auxiliar compartilhada</strong>
            <ProcessStatusBadge
              label={pumpRunning ? 'Ligada' : 'Desligada'}
              tone={pumpRunning ? 'success' : 'neutral'}
            />
          </div>
          <dl className={styles.compactFacts}>
            <div><dt>Equipamento</dt><dd>{auxiliary.bomba_auxiliar?.nome ?? 'Nao configurada'}</dd></div>
            <div><dt>Disponivel</dt><dd>{formatBoolean(auxiliary.bomba_auxiliar?.disponivel_hardware ?? null)}</dd></div>
            <div><dt>Controle</dt><dd>{formatLease(pumpHolder)}</dd></div>
            <div><dt>Ultimo status</dt><dd>{formatProcessDate(auxiliary.bomba_auxiliar?.ultimo_status_hardware_em)}</dd></div>
          </dl>
          {canControlAuxiliary && isManualControlMode ? (
            <div className={styles.actionGrid}>
              {!isLeaseActive(pumpHolder) ? (
                <button
                  type="button"
                  onClick={() => requestConfirmation(
                    'Assumir controle da bomba auxiliar?',
                    'A automacao cedera o recurso durante o lease. Novos acionamentos dependerao do operador titular.',
                    'Assumir bomba',
                    onAcquirePump,
                  )}
                  disabled={Boolean(actionLoading)}
                >
                  <LockKeyhole size={14} aria-hidden="true" />
                  Assumir bomba
                </button>
              ) : null}
              {pumpOwnedByCurrentUser ? (
                <button
                  type="button"
                  onClick={() => requestConfirmation(
                    'Liberar controle da bomba auxiliar?',
                    'O lease sera encerrado e a automacao podera retomar o recurso conforme o modo configurado.',
                    'Liberar bomba',
                    onReleasePump,
                  )}
                  disabled={Boolean(actionLoading)}
                >
                  <UnlockKeyhole size={14} aria-hidden="true" />
                  Liberar bomba
                </button>
              ) : null}
              {pumpOwnedByCurrentUser ? (
                <button
                  type="button"
                  onClick={() => requestConfirmation(
                    'Desligar a bomba auxiliar?',
                    'O comando sera enviado com chave idempotente e a confirmacao real continuara dependendo da telemetria do hardware.',
                    'Desligar bomba',
                    onTurnOffPump,
                  )}
                  disabled={Boolean(actionLoading)}
                >
                  <PowerOff size={14} aria-hidden="true" />
                  Desligar bomba
                </button>
              ) : null}
              {pumpLeaseHeldByOther ? <small>Bomba sob lease de outro usuario.</small> : null}
            </div>
          ) : (
            <p className={styles.contractNote}>
              {mode === 'AUTOMATICO'
                ? 'Controle humano de energizacao e bloqueado pela API no modo automatico.'
                : 'Somente tecnico ou administrador pode assumir o controle.'}
            </p>
          )}
        </article>

        <article className={styles.systemCard}>
          <div className={styles.stateTitle}>
            <ShieldCheck size={17} aria-hidden="true" />
            <strong>Encerramento geral</strong>
            <ProcessStatusBadge label={humanizeStatus(closure.status)} tone={getOperationalTone(closure.status)} />
          </div>
          <dl className={styles.compactFacts}>
            <div><dt>Etapa</dt><dd>{humanizeStatus(closure.etapa)}</dd></div>
            <div><dt>Automatico</dt><dd>{formatBoolean(closure.automatico)}</dd></div>
            <div><dt>Hardware confirmado</dt><dd>{formatBoolean(closure.hardware_confirmado)}</dd></div>
            <div>
              <dt>Tanques concluidos</dt>
              <dd>{dashboard.encerramento.tanques_concluidos}/{dashboard.encerramento.total_tanques}</dd>
            </div>
          </dl>
          {closure.ultimo_erro ? <p className={styles.inlineWarning}>{closure.ultimo_erro}</p> : null}
          {canStartClosures && canFinalizeClosure ? (
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => requestConfirmation(
                'Finalizar o encerramento geral?',
                'A API iniciara a sequencia segura final usando a versao atual. Conclusao visual so ocorrera apos confirmacao do hardware.',
                'Finalizar encerramento',
                onFinalizeGeneralClosure,
              )}
              disabled={Boolean(actionLoading)}
            >
              <ShieldCheck size={15} aria-hidden="true" />
              Finalizar encerramento geral
            </button>
          ) : null}
        </article>
      </div>

      {canStartClosures || (canControlAuxiliary && isManualControlMode) ? (
        <section className={styles.controlContext} aria-label="Contexto das acoes operacionais">
          <label>
            Motivo da intervencao
            <input
              value={reason}
              minLength={3}
              maxLength={500}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder="Descreva a intervencao supervisionada"
            />
          </label>
          {canControlAuxiliary && isManualControlMode ? (
            <label>
              Duracao do lease
              <select
                value={leaseDuration}
                onChange={(event) => onLeaseDurationChange(Number(event.target.value))}
              >
                <option value={60}>1 minuto</option>
                <option value={120}>2 minutos</option>
                <option value={180}>3 minutos</option>
                <option value={300}>5 minutos</option>
              </select>
            </label>
          ) : null}
          <div>
            <Clock3 size={17} aria-hidden="true" />
            <span>
              {canControlAuxiliary && isManualControlMode
                ? 'Ao expirar, o lease deixa de autorizar novos comandos. Renove assumindo o controle novamente.'
                : 'O motivo informado sera registrado nas autorizacoes manuais de encerramento.'}
            </span>
          </div>
        </section>
      ) : null}

      <div className={styles.tankGrid}>
        {tankSlots.map((tank, index) => (
          <TankCard
            key={tank?.id_processo_tanque ?? `unused-${index}`}
            slot={index + 1}
            tank={tank}
            auxiliaryTank={
              tank
                ? auxiliary.tanques.find((item) => item.id_processo_tanque === tank.id_processo_tanque) ?? null
                : null
            }
            currentUserId={currentUserId}
            canControlAuxiliary={canControlAuxiliary}
            canStartClosures={canStartClosures}
            isManualControlMode={isManualControlMode}
            pumpOwnedByCurrentUser={pumpOwnedByCurrentUser}
            actionLoading={actionLoading}
            onAcquireValve={(idProcessoTanque) => requestConfirmation(
              'Assumir controle desta valvula?',
              'A automacao cedera a valvula auxiliar durante o lease informado.',
              'Assumir valvula',
              () => onAcquireValve(idProcessoTanque),
            )}
            onReleaseValve={(idProcessoTanque) => requestConfirmation(
              'Liberar controle desta valvula?',
              'O lease da valvula sera encerrado e o recurso voltara ao controle previsto pelo modo.',
              'Liberar valvula',
              () => onReleaseValve(idProcessoTanque),
            )}
            onTurnOnPump={(idProcessoTanque) => requestConfirmation(
              'Ligar a bomba auxiliar para este tanque?',
              'Este comando energiza hardware. A API validara processo, acoplamento, fila, leases e versoes antes de publicar no MQTT.',
              'Ligar bomba',
              () => onTurnOnPump(idProcessoTanque),
            )}
            onOpenValve={(idProcessoTanque) => requestConfirmation(
              'Abrir a valvula auxiliar deste tanque?',
              'Este comando altera o caminho de vacuo e sera submetido aos intertravamentos da API.',
              'Abrir valvula',
              () => onOpenValve(idProcessoTanque),
            )}
            onCloseValve={(idProcessoTanque) => requestConfirmation(
              'Fechar a valvula auxiliar deste tanque?',
              'Confirme o isolamento do caminho auxiliar. O estado exibido so mudara com o novo snapshot da API.',
              'Fechar valvula',
              () => onCloseValve(idProcessoTanque),
            )}
            onStartTankClosure={(idProcessoTanque) => requestConfirmation(
              'Iniciar encerramento individual deste tanque?',
              'A API iniciara isolamento, retencao e validacao usando a versao atual do tanque.',
              'Iniciar encerramento',
              () => onStartTankClosure(idProcessoTanque),
            )}
          />
        ))}
      </div>

      {pendingConfirmation ? (
        <div className={styles.confirmOverlay} role="presentation">
          <section
            className={styles.confirmDialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="operational-confirm-title"
          >
            <p className={styles.overline}>Confirmacao operacional</p>
            <h3 id="operational-confirm-title">{pendingConfirmation.title}</h3>
            <p>{pendingConfirmation.description}</p>
            <div>
              <button
                type="button"
                onClick={() => setPendingConfirmation(null)}
                disabled={Boolean(actionLoading)}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = pendingConfirmation.onConfirm;
                  setPendingConfirmation(null);
                  action();
                }}
                disabled={Boolean(actionLoading)}
              >
                {pendingConfirmation.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
