import { Cpu } from 'lucide-react';
import type { HardwareStatusPayload, HeartbeatPayload } from '../../../services/realtime';
import type { MqttHardwareStatusResponse } from '../../../types';
import { formatBoolean, formatDateTime, getHardwareEsp32Online } from '../mqttHardwareUtils';
import styles from './Esp32StatusCard.module.scss';

type Esp32StatusCardProps = {
  status: MqttHardwareStatusResponse | null;
  hardwareStatus: HardwareStatusPayload | null;
  heartbeat: HeartbeatPayload | null;
};

export function Esp32StatusCard({ status, hardwareStatus, heartbeat }: Esp32StatusCardProps) {
  const esp32Online = getHardwareEsp32Online(status, hardwareStatus, heartbeat);
  const statusMessage =
    hardwareStatus?.mensagem ??
    (esp32Online === false
      ? 'ESP32 offline. Verifique alimentacao, rede e publicacao MQTT.'
      : 'Aguardando heartbeat do ESP32.');

  return (
    <section className={styles.card}>
      <header>
        <div>
          <p>ESP32</p>
          <h2>Estado do hardware</h2>
        </div>
        <span className={esp32Online ? styles.online : styles.offline}>{formatBoolean(esp32Online)}</span>
      </header>

      <dl className={styles.grid}>
        <div>
          <dt>Ultimo heartbeat</dt>
          <dd>{formatDateTime(heartbeat?.enviado_em)}</dd>
        </div>
        <div>
          <dt>Firmware</dt>
          <dd>{heartbeat?.firmware ?? 'Indisponivel'}</dd>
        </div>
        <div>
          <dt>Uptime</dt>
          <dd>{heartbeat?.uptime ?? 'Indisponivel'}</dd>
        </div>
        <div>
          <dt>Ultimo status</dt>
          <dd>{formatDateTime(hardwareStatus?.enviado_em ?? status?.enviado_em ?? status?.consultado_em)}</dd>
        </div>
      </dl>

      <footer>
        <Cpu size={16} aria-hidden="true" />
        <span>{statusMessage}</span>
      </footer>
    </section>
  );
}
