import { motion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ActiveProcessPanel } from '../../components/processos/ActiveProcessPanel';
import { RealDataChartPanel } from '../../components/charts/RealDataChartPanel';
import { ConfirmProcessActionModal } from '../../components/processos/ConfirmProcessActionModal';
import { NewProcessModal } from '../../components/processos/NewProcessModal';
import { ProcessDetailPanel } from '../../components/processos/ProcessDetailPanel';
import { ProcessDetailsErrorBoundary } from '../../components/processos/ProcessDetailsErrorBoundary';
import { ProcessPrecheckPanel } from '../../components/processos/ProcessPrecheckPanel';
import { ProcessListTable, STATUS_OPTIONS } from '../../components/processos/ProcessListTable';
import { ProcessStatusBadge } from '../../components/processos/ProcessStatusBadge';
import { useMqttHardwareRealtime } from '../../hooks/useMqttHardwareRealtime';
import { useProcessActions } from '../../hooks/useProcessActions';
import { useProcessPermissions } from '../../hooks/useProcessPermissions';
import { useProcessPrecheck } from '../../hooks/useProcessPrecheck';
import { useProcessosPage } from '../../hooks/useProcessosPage';
import { useSensorReadingsRealtime } from '../../hooks/useSensorReadingsRealtime';
import type {
  ProcessoAction,
  ProcessoActionState,
  ProcessoFormState,
  SensorReadingPayload,
} from '../../types';
import { countBy, toNumber } from '../../utils/chartData';
import { getAcoplamentoStatusSummary } from '../../components/processos/processos.utils';
import styles from './ProcessosPage.module.scss';

function isPrecheckExpired(executedAt?: string | null, validitySeconds?: number | null): boolean {
  if (!executedAt || !validitySeconds) {
    return true;
  }

  const timestamp = new Date(executedAt).getTime();

  if (Number.isNaN(timestamp)) {
    return true;
  }

  return Date.now() - timestamp > validitySeconds * 1000;
}

function formatShortTime(value: unknown): string {
  if (typeof value !== 'string' || !value) {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(11, 19) || value;
  }

  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getMqttStatusLabel(status?: string | null): string {
  if (!status) {
    return 'pendente';
  }

  if (status === 'CONNECTED' || status === 'CONECTADO') {
    return 'conectado';
  }

  if (status === 'DISCONNECTED' || status === 'DESCONECTADO') {
    return 'desconectado';
  }

  return status.toLowerCase();
}

function isMqttConnected(status?: string | null): boolean {
  return status === 'CONNECTED' || status === 'CONECTADO';
}

function getHardwareMqttStatus(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function getReadingTimestamp(reading: SensorReadingPayload): number {
  const rawTimestamp = reading.registrado_em ?? reading.enviado_em ?? reading.criado_em;

  if (typeof rawTimestamp !== 'string' || !rawTimestamp) {
    return 0;
  }

  const timestamp = new Date(rawTimestamp).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function ProcessosPage() {
  const {
    data,
    filters,
    isLoading,
    isDetailLoading,
    error,
    detailError,
    setFilters,
    setPage,
    refresh,
    selectProcess,
  } = useProcessosPage();
  const permissions = useProcessPermissions();
  const { lastSensorReading } = useSensorReadingsRealtime();
  const { esp32Online, mqttConnectionStatus, hardwareState } = useMqttHardwareRealtime();
  const precheckProcess = data.selectedProcess ?? data.activeProcess;
  const detailsResetKey =
    precheckProcess?.id_processo ?? data.selectedProcess?.id_processo ?? data.activeProcess?.id_processo ?? null;
  const precheck = useProcessPrecheck(precheckProcess?.id_processo ?? null);
  const {
    actionLoading,
    actionError,
    actionSuccess,
    clearFeedback,
    createConfiguredProcess,
    runProcessAction,
  } = useProcessActions(refresh, {
    onPrecheckBlocked: precheck.setPrecheckFromBackend,
  });
  const [isNewProcessOpen, setIsNewProcessOpen] = useState<boolean>(false);
  const [actionState, setActionState] = useState<ProcessoActionState | null>(null);
  const [liveVacuumReadings, setLiveVacuumReadings] = useState<SensorReadingPayload[]>([]);
  const processosPorStatus = countBy(data.processes, (processo) => processo.status_processo);
  const currentProcessPrecheck =
    precheckProcess && precheck.precheck?.id_processo === precheckProcess.id_processo
      ? precheck.precheck
      : null;
  const acoplamentoStatus = getAcoplamentoStatusSummary(currentProcessPrecheck);
  const mqttStatus =
    mqttConnectionStatus?.status_conexao ??
    getHardwareMqttStatus(hardwareState?.mqttStatus) ??
    (hardwareState?.mqttConnected === true ? 'CONECTADO' : null);
  const activeProcessId = data.activeProcess?.id_processo ?? null;
  const activeVacuumReadings = useMemo(() => {
    if (!activeProcessId) {
      return [];
    }

    const selectedReadings =
      data.selectedProcess?.id_processo === activeProcessId ? data.selectedReadings : [];
    const mergedReadings = [...data.activeReadings, ...selectedReadings, ...liveVacuumReadings];
    const uniqueReadings = new Map<string, SensorReadingPayload>();

    mergedReadings.forEach((reading, index) => {
      const value = toNumber(reading.valor_vacuo);

      if (value === null) {
        return;
      }

      const key =
        String(reading.id_leitura_sensor ?? '') ||
        `${reading.registrado_em ?? reading.enviado_em ?? 'live'}-${index}`;

      uniqueReadings.set(key, reading);
    });

    return Array.from(uniqueReadings.values())
      .sort((current, next) => getReadingTimestamp(current) - getReadingTimestamp(next))
      .slice(-30);
  }, [
    activeProcessId,
    data.activeReadings,
    data.selectedProcess?.id_processo,
    data.selectedReadings,
    liveVacuumReadings,
  ]);
  const activeVacuumChartData = activeVacuumReadings.map((reading) => ({
    name: formatShortTime(reading.registrado_em ?? reading.enviado_em),
    value: toNumber(reading.valor_vacuo) ?? 0,
  }));
  const selectedVacuumChartData = data.selectedReadings.map((reading) => ({
    name: formatShortTime(reading.registrado_em ?? reading.criado_em),
    value: toNumber(reading.valor_vacuo) ?? 0,
  })).reverse();
  const shouldShowRealtimeVacuumChart = Boolean(data.activeProcess);
  const shouldShowSelectedVacuumChart = !data.activeProcess && Boolean(data.selectedProcess);
  const startBlockedMessage =
    currentProcessPrecheck &&
    (!currentProcessPrecheck.aprovado ||
      currentProcessPrecheck.bloqueado ||
      isPrecheckExpired(currentProcessPrecheck.executado_em, currentProcessPrecheck.validade_segundos))
      ? 'Execute uma pre-checagem aprovada e dentro da validade antes de iniciar.'
      : null;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLiveVacuumReadings([]);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeProcessId]);

  useEffect(() => {
    if (!activeProcessId || !lastSensorReading) {
      return;
    }

    if (lastSensorReading.id_processo && lastSensorReading.id_processo !== activeProcessId) {
      return;
    }

    if (toNumber(lastSensorReading.valor_vacuo) === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLiveVacuumReadings((currentReadings) => [...currentReadings, lastSensorReading].slice(-30));
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeProcessId, lastSensorReading]);

  async function handleCreateProcess(form: ProcessoFormState): Promise<void> {
    await createConfiguredProcess(form);
    setIsNewProcessOpen(false);
  }

  async function handleConfirmAction(
    action: ProcessoAction,
    idProcesso: number,
    reason: string,
  ): Promise<void> {
    await runProcessAction(action, idProcesso, reason);
    setActionState(null);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>TSEA / Operacao</p>
          <h1>Processos</h1>
          <p>Gerencie e acompanhe os processos de vacuo do sistema TSEA.</p>
        </div>

        <div className={styles.headerActions}>
          {permissions.canCreateProcess ? (
            <button type="button" onClick={() => setIsNewProcessOpen(true)}>
              <Plus size={16} aria-hidden="true" />
              Novo processo
            </button>
          ) : null}
          <button type="button" onClick={() => void refresh()} disabled={isLoading}>
            <RefreshCw size={16} aria-hidden="true" />
            {isLoading ? 'Atualizando' : 'Atualizar'}
          </button>
        </div>
      </header>

      <section className={styles.statusStrip} aria-label="Status operacional">
        <ProcessStatusBadge
          label={`MQTT ${getMqttStatusLabel(mqttStatus)}`}
          tone={isMqttConnected(mqttStatus) ? 'success' : 'neutral'}
        />
        <ProcessStatusBadge
          label={`ESP32 ${esp32Online === true ? 'online' : 'pendente'}`}
          tone={esp32Online === true ? 'success' : 'neutral'}
        />
        <ProcessStatusBadge
          label={`Acoplamento ${acoplamentoStatus.label.toLowerCase()}`}
          tone={acoplamentoStatus.tone}
        />
        <ProcessStatusBadge
          label={`Ultima leitura ${
            typeof lastSensorReading?.valor_vacuo === 'number'
              ? `${lastSensorReading.valor_vacuo} mbar`
              : 'pendente'
          }`}
          tone="info"
        />
      </section>

      {error ? (
        <section className={styles.errorState} role="alert">
          <strong>Nao foi possivel carregar os processos.</strong>
          <span>{error}</span>
        </section>
      ) : null}

      {actionError ? (
        <section className={styles.errorState} role="alert">
          <strong>Acao nao concluida.</strong>
          <span>{actionError}</span>
          <button type="button" onClick={clearFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}

      {actionSuccess ? (
        <section className={styles.successState} role="status">
          <strong>{actionSuccess}</strong>
          <button type="button" onClick={clearFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}

      <ActiveProcessPanel
        process={data.activeProcess}
        permissions={permissions}
        loadingAction={actionLoading}
        lastReading={lastSensorReading}
        acoplamentoStatusLabel={acoplamentoStatus.label}
        esp32Online={esp32Online}
        startBlockedMessage={startBlockedMessage}
        onAction={(action, process) => setActionState({ type: action, process })}
        onCreate={() => setIsNewProcessOpen(true)}
      />

      <section className={styles.chartGrid} aria-label="Graficos de processos">
        <RealDataChartPanel
          title="Processos por status"
          subtitle="Distribuicao da listagem atual retornada pela API."
          data={processosPorStatus}
          variant="pie"
        />
        {shouldShowRealtimeVacuumChart ? (
          <RealDataChartPanel
            title="Vacuo em tempo real"
            subtitle="Leituras recebidas por Socket.IO para o processo ativo."
            data={activeVacuumChartData}
            variant="line"
            valueLabel="Vacuo"
            emptyMessage="Aguardando leituras em tempo real do processo ativo."
          />
        ) : null}
        {shouldShowSelectedVacuumChart ? (
          <RealDataChartPanel
            title="Vacuo do processo selecionado"
            subtitle="Leituras de valor_vacuo carregadas pela API para o processo selecionado."
            data={selectedVacuumChartData}
            variant="line"
            valueLabel="Vacuo"
            emptyMessage="Nenhuma leitura de vacuo retornada para o processo selecionado."
          />
        ) : null}
      </section>

      <motion.section
        className={styles.filters}
        initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.label initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02, duration: 0.2 }}>
          Busca
          <input
            value={filters.busca}
            onChange={(event) => setFilters({ ...filters, busca: event.target.value })}
            placeholder="Nome ou identificacao"
          />
        </motion.label>
        <motion.label initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04, duration: 0.2 }}>
          Status
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters({ ...filters, status: event.target.value as typeof filters.status })
            }
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status || 'todos'} value={status}>
                {status || 'Todos'}
              </option>
            ))}
          </select>
        </motion.label>
      </motion.section>

      <ProcessDetailsErrorBoundary resetKey={detailsResetKey}>
        <ProcessPrecheckPanel
          precheck={precheck.precheck}
          valves={precheck.valves}
          tanks={precheck.tanks}
          sensors={precheck.sensors}
          processStatus={precheckProcess?.status_processo}
          hasProcess={Boolean(precheckProcess)}
          isLoading={precheck.isLoading}
          loadingAction={precheck.loadingAction}
          error={precheck.error}
          feedback={precheck.feedback}
          socketFeedback={precheck.socketFeedback}
          canStartProcess={Boolean(
            precheckProcess && permissions.canStartProcess(precheckProcess.status_processo),
          )}
          isStartingProcess={actionLoading === 'start'}
          startBlockedMessage={startBlockedMessage}
          onRefresh={() => void precheck.refreshPrecheck()}
          onExecute={() => void precheck.executePrecheck()}
          onStartProcess={
            precheckProcess
              ? () => setActionState({ type: 'start', process: precheckProcess })
              : undefined
          }
          onValidateTank={(idTanque) => void precheck.validateTankCoupling(idTanque)}
          onValidateSensor={(idSensor) => void precheck.validateSensor(idSensor)}
          onValidateValve={(idValvula) => void precheck.validateValve(idValvula)}
          onOpenValve={(idValvula) => void precheck.openValve(idValvula)}
          onCloseValve={(idValvula) => void precheck.closeValve(idValvula)}
          onClearFeedback={precheck.clearFeedback}
        />

        <section className={styles.contentGrid}>
          <ProcessListTable
            processes={data.processes}
            total={data.total}
            page={data.page}
            limit={data.limit}
            isLoading={isLoading}
            selectedId={data.selectedProcess?.id_processo}
            onSelect={(idProcesso) => void selectProcess(idProcesso)}
            onPageChange={setPage}
          />

          <ProcessDetailPanel
            process={data.selectedProcess}
            readings={data.selectedReadings}
            events={data.selectedEvents}
            isLoading={isDetailLoading}
            error={detailError}
          />
        </section>
      </ProcessDetailsErrorBoundary>

      <NewProcessModal
        key={isNewProcessOpen ? 'new-process-open' : 'new-process-closed'}
        isOpen={isNewProcessOpen}
        isSubmitting={actionLoading === 'create'}
        onClose={() => setIsNewProcessOpen(false)}
        onSubmit={handleCreateProcess}
      />

      <ConfirmProcessActionModal
        actionState={actionState}
        isSubmitting={Boolean(actionLoading)}
        onCancel={() => setActionState(null)}
        onConfirm={handleConfirmAction}
      />
    </main>
  );
}
