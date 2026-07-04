import { Cpu, Link2, RadioTower, Waves } from 'lucide-react';
import type {
  HeartbeatPayload,
  MqttConnectionStatusPayload,
  MqttHardwareStatusResponse,
  ProcessoPrecheckResponse,
  SensorReadingPayload,
} from '../../../types';
import { getAcoplamentoStatusSummary } from '../../processos/processos.utils';
import { formatBoolean, formatDateTime, formatNumber, getMqttTone } from '../dashboard.utils';
import { StatusBadge } from '../StatusBadge';
import styles from './SystemStatusPanel.module.scss';

type SystemStatusPanelProps = {
  hardwareStatus: MqttHardwareStatusResponse | null;
  mqttRealtimeStatus?: MqttConnectionStatusPayload | null;
  isRealtimeConnected: boolean;
  isRealtimeConnecting: boolean;
  esp32Online?: boolean | null;
  lastHeartbeat?: HeartbeatPayload | null;
  lastSensorReading?: SensorReadingPayload | null;
  activePrecheck?: ProcessoPrecheckResponse | null;
  eventsCount: number;
  partialError?: string;
  realtimeError?: string | null;
};

export function SystemStatusPanel({
  hardwareStatus,
  mqttRealtimeStatus,
  isRealtimeConnected,
  isRealtimeConnecting,
  esp32Online,
  lastHeartbeat,
  lastSensorReading,
  activePrecheck,
  eventsCount,
  partialError,
  realtimeError,
}: SystemStatusPanelProps) {
  const mqttStatus =
    mqttRealtimeStatus?.status_conexao ??
    hardwareStatus?.status_conexao ??
    hardwareStatus?.mqtt?.status_conexao ??
    'Sem status';
  const currentEsp32Status =
    esp32Online ?? hardwareStatus?.esp32_online ?? hardwareStatus?.hardware?.esp32Online ?? null;
  const realtimeLabel = isRealtimeConnected
    ? 'Realtime online'
    : isRealtimeConnecting
      ? 'Realtime conectando'
      : 'Realtime offline';
  const acoplamentoStatus = getAcoplamentoStatusSummary(activePrecheck);

  return (
    <article className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <p className={styles.overline}>Status do sistema</p>
          <h2>Comunicacao e hardware</h2>
        </div>
        <StatusBadge label={mqttStatus} tone={getMqttTone(mqttStatus)} />
      </header>

      <div className={styles.grid}>
        <div className={styles.item}>
          <RadioTower size={18} aria-hidden="true" />
          <span>MQTT</span>
          <strong>{mqttStatus}</strong>
        </div>
        <div className={styles.item}>
          <Cpu size={18} aria-hidden="true" />
          <span>ESP32</span>
          <strong>{formatBoolean(currentEsp32Status)}</strong>
        </div>
        <div className={styles.item}>
          <Waves size={18} aria-hidden="true" />
          <span>Ultima leitura</span>
          <strong>{formatNumber(lastSensorReading?.valor_vacuo ?? null, 'mbar')}</strong>
        </div>
        <div className={styles.item}>
          <Link2 size={18} aria-hidden="true" />
          <span>Acoplamento</span>
          <strong>{acoplamentoStatus.label}</strong>
        </div>
      </div>

      <footer className={styles.footer}>
        <StatusBadge label={realtimeLabel} tone={isRealtimeConnected ? 'success' : 'neutral'} />
        <span>Eventos recebidos: {eventsCount}</span>
        <span>
          Heartbeat:{' '}
          {formatDateTime(
            lastHeartbeat?.enviado_em ??
              hardwareStatus?.enviado_em ??
              hardwareStatus?.hardware?.lastHeartbeatAt,
          )}
        </span>
      </footer>

      {partialError ? <p className={styles.partialError}>{partialError}</p> : null}
      {realtimeError ? <p className={styles.partialError}>{realtimeError}</p> : null}
    </article>
  );
}
