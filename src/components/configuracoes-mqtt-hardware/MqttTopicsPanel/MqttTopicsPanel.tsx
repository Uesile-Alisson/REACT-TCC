import type { MqttHardwareConfigResponse } from '../../../types';
import styles from './MqttTopicsPanel.module.scss';

type MqttTopicsPanelProps = {
  config: MqttHardwareConfigResponse | null;
};

const topicRows: Array<{ key: keyof MqttHardwareConfigResponse; label: string }> = [
  { key: 'topico_leituras', label: 'Leituras' },
  { key: 'topico_comandos', label: 'Comandos' },
  { key: 'topico_status', label: 'Status' },
  { key: 'topico_alarmes', label: 'Alarmes' },
  { key: 'topico_heartbeat', label: 'Heartbeat' },
  { key: 'topico_acoplamentos', label: 'Acoplamentos' },
];

export function MqttTopicsPanel({ config }: MqttTopicsPanelProps) {
  return (
    <section className={styles.panel}>
      <header>
        <p>Topicos MQTT</p>
        <h2>Rotas de comunicacao</h2>
      </header>

      <div className={styles.list}>
        {topicRows.map((row) => (
          <div key={row.key}>
            <span>{row.label}</span>
            <strong>{String(config?.[row.key] ?? 'Indisponivel')}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
