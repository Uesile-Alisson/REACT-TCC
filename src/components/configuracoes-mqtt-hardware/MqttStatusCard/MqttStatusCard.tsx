import { RadioTower } from 'lucide-react';
import type { MqttConnectionStatusPayload } from '../../../services/realtime';
import type { MqttHardwareConfigResponse, MqttHardwareStatusResponse } from '../../../types';
import { formatDateTime, getMqttStatusLabel, getStatusTone } from '../mqttHardwareUtils';
import styles from './MqttStatusCard.module.scss';

type MqttStatusCardProps = {
  config: MqttHardwareConfigResponse | null;
  status: MqttHardwareStatusResponse | null;
  realtimeStatus: MqttConnectionStatusPayload | null;
  realtimeConnected: boolean;
  realtimeConnecting: boolean;
  realtimeError: string | null;
};

export function MqttStatusCard({
  config,
  status,
  realtimeStatus,
  realtimeConnected,
  realtimeConnecting,
  realtimeError,
}: MqttStatusCardProps) {
  const mqtt = status?.mqtt;
  const currentStatus = realtimeStatus?.status_conexao ?? mqtt?.status_conexao ?? config?.status_conexao;
  const tone = getStatusTone(currentStatus);

  return (
    <section className={styles.card}>
      <header>
        <div>
          <p>MQTT</p>
          <h2>Conexao do broker</h2>
        </div>
        <span className={`${styles.badge} ${styles[tone]}`}>{getMqttStatusLabel(currentStatus)}</span>
      </header>

      <dl className={styles.grid}>
        <div>
          <dt>Broker</dt>
          <dd>{mqtt?.broker_url ?? config?.broker_url ?? 'Indisponivel'}</dd>
        </div>
        <div>
          <dt>Porta</dt>
          <dd>{mqtt?.porta ?? config?.porta ?? 'Indisponivel'}</dd>
        </div>
        <div>
          <dt>Ultima conexao</dt>
          <dd>{formatDateTime(mqtt?.ultima_conexao ?? config?.ultima_conexao)}</dd>
        </div>
        <div>
          <dt>Ultima sincronizacao</dt>
          <dd>{formatDateTime(mqtt?.ultima_sincronizacao ?? config?.ultima_sincronizacao)}</dd>
        </div>
      </dl>

      <footer>
        <RadioTower size={16} aria-hidden="true" />
        <span>
          Realtime {realtimeConnected ? 'ativo' : realtimeConnecting ? 'conectando' : 'indisponivel'}
          {realtimeError ? `: ${realtimeError}` : ''}
        </span>
      </footer>
    </section>
  );
}
