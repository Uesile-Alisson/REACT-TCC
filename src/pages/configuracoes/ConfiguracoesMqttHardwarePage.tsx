import { RefreshCw, RotateCcw, Save } from 'lucide-react';
import { Esp32StatusCard } from '../../components/configuracoes-mqtt-hardware/Esp32StatusCard';
import { HardwareActionsPanel } from '../../components/configuracoes-mqtt-hardware/HardwareActionsPanel';
import { HardwareReadingsCard } from '../../components/configuracoes-mqtt-hardware/HardwareReadingsCard';
import { MqttConfigForm } from '../../components/configuracoes-mqtt-hardware/MqttConfigForm';
import { MqttStatusCard } from '../../components/configuracoes-mqtt-hardware/MqttStatusCard';
import { MqttTopicsPanel } from '../../components/configuracoes-mqtt-hardware/MqttTopicsPanel';
import { useAcoplamentoRealtime } from '../../hooks/useAcoplamentoRealtime';
import { useConfiguracoesMqttHardware } from '../../hooks/useConfiguracoesMqttHardware';
import { useHardwareActions } from '../../hooks/useHardwareActions';
import { useMqttConfigForm } from '../../hooks/useMqttConfigForm';
import { useMqttHardwarePermissions } from '../../hooks/useMqttHardwarePermissions';
import { useMqttHardwareRealtime } from '../../hooks/useMqttHardwareRealtime';
import { useSensorReadingsRealtime } from '../../hooks/useSensorReadingsRealtime';
import styles from './ConfiguracoesMqttHardwarePage.module.scss';

export function ConfiguracoesMqttHardwarePage() {
  const {
    config,
    status,
    isLoading,
    isSaving,
    configError,
    statusError,
    success,
    refresh,
    saveConfig,
    clearFeedback,
  } = useConfiguracoesMqttHardware();
  const permissions = useMqttHardwarePermissions();
  const { formState, errors, isDirty, updateField, resetForm, validate } = useMqttConfigForm(config);
  const {
    isConnected,
    isConnecting,
    lastError,
    mqttConnectionStatus,
    mqttError,
    hardwareStatus,
    esp32Online,
    lastHeartbeat,
    eventsCount,
  } = useMqttHardwareRealtime();
  const { lastSensorReading } = useSensorReadingsRealtime();
  const { lastAcoplamento } = useAcoplamentoRealtime();
  const {
    actionLoading,
    actionError,
    actionSuccess,
    clearActionFeedback,
    handleRestartCommunication,
    handleSyncHardware,
  } = useHardwareActions();
  const canSave = permissions.canEditMqttHardwareConfig && isDirty && !isSaving;
  const effectiveHeartbeat =
    esp32Online === null ? lastHeartbeat : { ...(lastHeartbeat ?? {}), esp32_online: esp32Online };

  async function handleSave(): Promise<void> {
    const result = validate();

    if (!result) {
      return;
    }

    const successSave = await saveConfig(result.payload);

    if (successSave) {
      resetForm();
    }
  }

  if (!permissions.canViewMqttHardwareConfig) {
    return (
      <main className={styles.page}>
        <section className={styles.errorState} role="alert">
          <strong>Acesso negado.</strong>
          <span>Seu perfil nao possui permissao para visualizar Configuracoes MQTT/Hardware.</span>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>TSEA / Comunicacao industrial</p>
          <h1>Configuracoes MQTT/Hardware</h1>
          <p>Gerencie a comunicacao MQTT e acompanhe o estado do hardware do sistema TSEA.</p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" onClick={() => void refresh()} disabled={isLoading || isSaving}>
            <RefreshCw size={16} aria-hidden="true" />
            {isLoading ? 'Atualizando' : 'Atualizar'}
          </button>
          <button type="button" onClick={resetForm} disabled={!isDirty || isSaving}>
            <RotateCcw size={16} aria-hidden="true" />
            Restaurar
          </button>
          <button type="button" onClick={() => void handleSave()} disabled={!canSave}>
            <Save size={16} aria-hidden="true" />
            {isSaving ? 'Salvando' : 'Salvar alteracoes'}
          </button>
        </div>
      </header>

      {configError ? (
        <section className={styles.errorState} role="alert">
          <strong>Configuracao indisponivel.</strong>
          <span>{configError}</span>
          <button type="button" onClick={clearFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}

      {statusError ? (
        <section className={styles.warningState} role="status">
          <strong>Status indisponivel.</strong>
          <span>{statusError}</span>
        </section>
      ) : null}

      {success ? (
        <section className={styles.successState} role="status">
          <strong>{success}</strong>
          <span>O backend continua responsavel por reconectar e validar a comunicacao.</span>
        </section>
      ) : null}

      {!permissions.canEditMqttHardwareConfig ? (
        <section className={styles.readOnlyState} role="status">
          <strong>Modo somente leitura.</strong>
          <span>O endpoint de alteracao MQTT e restrito a ADMINISTRADOR no backend.</span>
        </section>
      ) : null}

      <section className={styles.statusGrid}>
        <MqttStatusCard
          config={config}
          status={status}
          realtimeStatus={mqttConnectionStatus}
          realtimeConnected={isConnected}
          realtimeConnecting={isConnecting}
          realtimeError={lastError ?? mqttError?.error ?? null}
        />
        <Esp32StatusCard
          status={status}
          hardwareStatus={hardwareStatus}
          heartbeat={effectiveHeartbeat}
        />
        <HardwareReadingsCard reading={lastSensorReading} acoplamento={lastAcoplamento} />
      </section>

      <section className={styles.contentGrid}>
        <MqttConfigForm
          formState={formState}
          errors={errors}
          permissions={permissions}
          isSaving={isSaving}
          onChange={updateField}
        />

        <div className={styles.sideGrid}>
          <MqttTopicsPanel config={config} />
          <HardwareActionsPanel
            permissions={permissions}
            actionLoading={actionLoading}
            actionError={actionError}
            actionSuccess={actionSuccess}
            onRestartCommunication={() => void handleRestartCommunication().then((ok) => {
              if (ok) {
                void refresh();
              }
            })}
            onSyncHardware={() => void handleSyncHardware().then((ok) => {
              if (ok) {
                void refresh();
              }
            })}
            onClearFeedback={clearActionFeedback}
          />
        </div>
      </section>

      {!config && !isLoading ? (
        <section className={styles.emptyState} role="status">
          <strong>Nenhuma configuracao MQTT carregada.</strong>
          <span>Verifique a API ou as permissoes do usuario autenticado.</span>
        </section>
      ) : null}

      <section className={styles.realtimeState} role="status">
        <strong>Realtime</strong>
        <span>
          {isConnected ? 'Conectado' : isConnecting ? 'Conectando' : 'Indisponivel'} / eventos:
          {' '}
          {eventsCount}
        </span>
      </section>
    </main>
  );
}
