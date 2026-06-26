import { motion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ActiveProcessPanel } from '../../components/processos/ActiveProcessPanel';
import { RealDataChartPanel } from '../../components/charts/RealDataChartPanel';
import { ConfirmProcessActionModal } from '../../components/processos/ConfirmProcessActionModal';
import { NewProcessModal } from '../../components/processos/NewProcessModal';
import { ProcessDetailPanel } from '../../components/processos/ProcessDetailPanel';
import { ProcessListTable, STATUS_OPTIONS } from '../../components/processos/ProcessListTable';
import { ProcessStatusBadge } from '../../components/processos/ProcessStatusBadge';
import { useAcoplamentoRealtime } from '../../hooks/useAcoplamentoRealtime';
import { useMqttHardwareRealtime } from '../../hooks/useMqttHardwareRealtime';
import { useProcessActions } from '../../hooks/useProcessActions';
import { useProcessPermissions } from '../../hooks/useProcessPermissions';
import { useProcessosPage } from '../../hooks/useProcessosPage';
import { useSensorReadingsRealtime } from '../../hooks/useSensorReadingsRealtime';
import type { ProcessoAction, ProcessoActionState, ProcessoFormState } from '../../types';
import { countBy, formatShortDate, toNumber } from '../../utils/chartData';
import styles from './ProcessosPage.module.scss';

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
  const { lastAcoplamento } = useAcoplamentoRealtime();
  const { esp32Online, mqttConnectionStatus } = useMqttHardwareRealtime();
  const {
    actionLoading,
    actionError,
    actionSuccess,
    clearFeedback,
    createConfiguredProcess,
    runProcessAction,
  } = useProcessActions(refresh);
  const [isNewProcessOpen, setIsNewProcessOpen] = useState<boolean>(false);
  const [actionState, setActionState] = useState<ProcessoActionState | null>(null);
  const processosPorStatus = countBy(data.processes, (processo) => processo.status_processo);
  const leiturasVacuo = data.selectedReadings
    .map((reading) => ({
      name: formatShortDate(reading.registrado_em ?? reading.criado_em),
      value: toNumber(reading.valor_vacuo) ?? 0,
    }))
    .reverse();

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
          label={`MQTT ${mqttConnectionStatus?.status_conexao ?? 'pendente'}`}
          tone={mqttConnectionStatus?.status_conexao === 'CONNECTED' ? 'success' : 'neutral'}
        />
        <ProcessStatusBadge
          label={`ESP32 ${esp32Online === true ? 'online' : 'pendente'}`}
          tone={esp32Online === true ? 'success' : 'neutral'}
        />
        <ProcessStatusBadge
          label={`Acoplamento ${lastAcoplamento?.status_acoplamento ?? 'pendente'}`}
          tone="neutral"
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
        lastAcoplamento={lastAcoplamento}
        esp32Online={esp32Online}
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
        <RealDataChartPanel
          title="Leituras do processo selecionado"
          subtitle="Serie de valor_vacuo das leituras carregadas para o detalhe."
          data={leiturasVacuo}
          variant="line"
          emptyMessage="Selecione um processo com leituras para visualizar a serie."
        />
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
