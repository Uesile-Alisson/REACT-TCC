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

const COMMUNICATION_BLOCKER_LABELS: Record<string, string> = {
  CREDENCIAIS_MQTT_NAO_CONFIGURADAS: 'Usuario e senha MQTT ainda nao foram configurados.',
  CREDENCIAIS_MQTT_NAO_VERIFICADAS: 'As credenciais MQTT ainda nao foram verificadas.',
  MQTT_DESCONECTADO: 'O backend esta desconectado do broker MQTT.',
  CONFIGURACAO_MQTT_NAO_APLICADA: 'A configuracao MQTT ativa ainda nao foi aplicada.',
  ESP32_OFFLINE: 'O ESP32 esta offline ou sem heartbeat valido.',
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
  const currentStatus =
    realtimeStatus?.status_conexao ?? mqtt?.status_conexao ?? status?.status_conexao ?? config?.status_conexao;
  const tone = getStatusTone(currentStatus);
  const brokerConfigured = Boolean(mqtt?.broker_url || config?.broker_url);
  const brokerConnected = currentStatus === 'CONNECTED' || currentStatus === 'CONECTADO';
  const communicationReady = status?.comunicacao_pronta_para_processos === true;
  const communicationBlockers = status?.bloqueios_comunicacao_processos ?? [];
  const booleanLabel = (value: boolean | undefined) =>
    value === undefined ? 'Indisponivel' : value ? 'Sim' : 'Nao';
  const footerMessage = brokerConnected
    ? realtimeConnected
      ? 'Broker conectado. Socket.IO tambem esta recebendo eventos.'
      : 'Broker conectado pelo status HTTP/configuracao. Realtime ainda sem evento recente.'
    : realtimeError
      ? `Realtime indisponivel: ${realtimeError}`
      : realtimeConnecting
        ? 'Socket.IO conectando ao backend.'
        : brokerConfigured
          ? 'Broker configurado. Aguardando confirmacao de conexao pelo backend.'
          : 'Configuracao do broker ainda nao carregada nesta tela.';

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
        <div>
          <dt>Operacional</dt>
          <dd>{booleanLabel(mqtt?.operacional)}</dd>
        </div>
        <div>
          <dt>Configuracao aplicada</dt>
          <dd>{booleanLabel(mqtt?.configuracao_aplicada ?? config?.configuracao_aplicada)}</dd>
        </div>
        <div>
          <dt>Usuario / senha configurados</dt>
          <dd>
            {booleanLabel(mqtt?.usuario_mqtt_configurado ?? config?.usuario_mqtt_configurado)} /{' '}
            {booleanLabel(mqtt?.senha_mqtt_configurada ?? config?.senha_mqtt_configurada)}
          </dd>
        </div>
        <div>
          <dt>Credenciais verificadas</dt>
          <dd>{booleanLabel(mqtt?.credenciais_verificadas ?? config?.credenciais_verificadas)}</dd>
        </div>
        <div>
          <dt>Verificacao das credenciais</dt>
          <dd>{formatDateTime(mqtt?.credenciais_verificadas_em ?? config?.credenciais_verificadas_em)}</dd>
        </div>
        <div>
          <dt>Pronta para processos</dt>
          <dd>{booleanLabel(status?.comunicacao_pronta_para_processos)}</dd>
        </div>
      </dl>

      {(mqtt?.ultima_falha_credenciais ?? config?.ultima_falha_credenciais) ? (
        <div className={styles.failure} role="alert">
          <strong>Ultima falha de credenciais</strong>
          <span>{mqtt?.ultima_falha_credenciais ?? config?.ultima_falha_credenciais}</span>
        </div>
      ) : null}

      {!communicationReady && communicationBlockers.length > 0 ? (
        <div className={styles.blockers} role="status">
          <strong>Bloqueios de comunicacao para processos</strong>
          <ul>
            {communicationBlockers.map((blocker) => (
              <li key={blocker}>{COMMUNICATION_BLOCKER_LABELS[blocker] ?? blocker}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <footer>
        <RadioTower size={16} aria-hidden="true" />
        <span>{footerMessage}</span>
      </footer>
    </section>
  );
}
