import { RefreshCw, RotateCcw, Save } from 'lucide-react';
import { BackupQuickActions } from '../../components/backups/BackupQuickActions';
import { Esp32StatusCard } from '../../components/configuracoes-mqtt-hardware/Esp32StatusCard';
import { HardwareActionsPanel } from '../../components/configuracoes-mqtt-hardware/HardwareActionsPanel';
import { HardwareReadingsCard } from '../../components/configuracoes-mqtt-hardware/HardwareReadingsCard';
import { MqttConfigForm } from '../../components/configuracoes-mqtt-hardware/MqttConfigForm';
import { MqttStatusCard } from '../../components/configuracoes-mqtt-hardware/MqttStatusCard';
import { MqttTopicsPanel } from '../../components/configuracoes-mqtt-hardware/MqttTopicsPanel';
import { useAcoplamentoRealtime } from '../../hooks/useAcoplamentoRealtime';
import { useAuth } from '../../hooks/useAuth';
import { useConfiguracoesMqttHardware } from '../../hooks/useConfiguracoesMqttHardware';
import { useHardwareActions } from '../../hooks/useHardwareActions';
import { useMqttConfigForm } from '../../hooks/useMqttConfigForm';
import { useMqttHardwarePermissions } from '../../hooks/useMqttHardwarePermissions';
import { useMqttHardwareRealtime } from '../../hooks/useMqttHardwareRealtime';
import { useSensorReadingsRealtime } from '../../hooks/useSensorReadingsRealtime';
import styles from './ConfiguracoesMqttHardwarePage.module.scss';

export function ConfiguracoesMqttHardwarePage() {
  const { user } = useAuth();
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
    hardwareState,
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
  const canUseBackups = user?.nivel_acesso === 'ADMINISTRADOR';
  const effectiveHeartbeat =
    esp32Online === null ? lastHeartbeat : { ...(lastHeartbeat ?? {}), esp32_online: esp32Online };
  const mqttStatus =
    mqttConnectionStatus?.status_conexao ??
    status?.mqtt?.status_conexao ??
    status?.status_conexao ??
    config?.status_conexao;
  const esp32StatusKnown = effectiveHeartbeat?.esp32_online ?? status?.esp32_online ?? null;
  const currentEsp32Status =
    esp32StatusKnown ?? hardwareState?.esp32Online ?? status?.hardware?.esp32Online ?? null;
  const hasMqttConfig = Boolean(config?.id_mqtt_configuracao || config?.broker_url);
  const hasBrokerEndpoint = Boolean(status?.mqtt?.broker_url || config?.broker_url);
  const diagnosticItems = [
    {
      label: 'API',
      value: configError
        ? 'Falha ao consultar configuracao MQTT'
        : statusError
          ? 'Configuracao carregada, mas status retornou resposta parcial'
          : 'Consultas HTTP respondendo',
      tone: configError ? 'danger' : statusError ? 'warning' : 'success',
    },
    {
      label: 'Configuracao MQTT',
      value: hasMqttConfig
        ? `Configuracao carregada${config?.ativo === false ? ' (inativa)' : ''}`
        : 'Configuracao MQTT nao carregada nesta tela',
      tone: hasMqttConfig ? 'success' : 'warning',
    },
    {
      label: 'Broker MQTT',
      value:
        mqttStatus === 'CONNECTED' || mqttStatus === 'CONECTADO'
          ? 'Broker conectado'
          : mqttStatus === 'CONNECTING' || mqttStatus === 'RECONECTANDO'
            ? 'Broker conectando'
            : hasBrokerEndpoint
              ? 'Broker configurado, aguardando status realtime/HTTP'
              : 'Broker MQTT sem configuracao carregada',
      tone:
        mqttStatus === 'CONNECTED' || mqttStatus === 'CONECTADO'
          ? 'success'
          : mqttStatus === 'CONNECTING' || mqttStatus === 'RECONECTANDO' || hasBrokerEndpoint
            ? 'warning'
            : 'danger',
    },
    {
      label: 'ESP32',
      value:
        currentEsp32Status === true
          ? 'ESP32 online'
          : currentEsp32Status === false
            ? 'ESP32 offline'
            : 'Aguardando heartbeat do ESP32',
      tone: currentEsp32Status === true ? 'success' : currentEsp32Status === false ? 'danger' : 'warning',
    },
    {
      label: 'Socket.IO',
      value: isConnected ? 'Realtime conectado' : isConnecting ? 'Realtime conectando' : 'Socket indisponivel',
      tone: isConnected ? 'success' : isConnecting ? 'warning' : 'danger',
    },
  ];

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

      <section className={styles.diagnosticPanel} aria-label="Diagnostico MQTT e hardware">
        <header>
          <div>
            <p>Diagnostico</p>
            <h2>Por que pode aparecer indisponivel?</h2>
          </div>
          <span>Fonte: API + Socket.IO</span>
        </header>
        <div className={styles.diagnosticGrid}>
          {diagnosticItems.map((item) => (
            <article key={item.label} className={styles[item.tone]}>
              <strong>{item.label}</strong>
              <span>{item.value}</span>
            </article>
          ))}
        </div>
        <p>
          Para os dados aparecerem, mantenha a API rodando, uma configuracao MQTT ativa no banco,
          Mosquitto conectado e o ESP32 ou simulador publicando heartbeat/status.
        </p>
      </section>

      <BackupQuickActions
        title="Backups MQTT/Hardware"
        description="Gere ou restaure snapshots da configuracao MQTT. Backups completos tambem podem restaurar esta camada."
        generateType="MQTT"
        restoreTypes={['MQTT', 'COMPLETO']}
        canUseBackups={canUseBackups}
        restoreTitle="Restaurar backup MQTT/Hardware"
        postRestoreMessage="Configuracao MQTT restaurada. Teste a conexao ou reinicie a comunicacao para aplicar o estado operacional."
      />

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
        <HardwareReadingsCard
          reading={lastSensorReading}
          acoplamento={lastAcoplamento}
          status={status}
          hardwareStatus={hardwareStatus}
        />
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
