import { Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ActiveProcessPanel } from '../../components/processos/ActiveProcessPanel';
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

      <section className={styles.filters}>
        <label>
          Busca
          <input
            value={filters.busca}
            onChange={(event) => setFilters({ ...filters, busca: event.target.value })}
            placeholder="Nome ou identificacao"
          />
        </label>
        <label>
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
        </label>
      </section>

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
