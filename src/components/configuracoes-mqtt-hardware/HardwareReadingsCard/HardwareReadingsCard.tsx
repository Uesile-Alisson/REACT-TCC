import { Gauge } from 'lucide-react';
import type {
  HardwareStatusPayload,
  SensorAcoplamentoPayload,
  SensorReadingPayload,
} from '../../../services/realtime';
import type { MqttHardwareStatusResponse, ValvulaHardware } from '../../../types';
import {
  getExpectedValveCode,
  getTanqueHardwareComValvulas,
  getTanqueHardwareLabel,
  groupValvulasByTanque,
  TANQUES_HARDWARE,
} from '../../../utils/hardwareValvulas';
import { formatDateTime, getAcoplamentoLabel, getSensorLabel } from '../mqttHardwareUtils';
import styles from './HardwareReadingsCard.module.scss';

type HardwareReadingsCardProps = {
  reading: SensorReadingPayload | null;
  acoplamento: SensorAcoplamentoPayload | null;
  status: MqttHardwareStatusResponse | null;
  hardwareStatus: HardwareStatusPayload | null;
};

function formatValveOpenState(valvula?: ValvulaHardware): string {
  if (valvula?.aberta === true) {
    return 'Aberta';
  }

  if (valvula?.aberta === false) {
    return 'Fechada';
  }

  return 'Sem status';
}

function formatValveAvailability(valvula?: ValvulaHardware): string {
  if (valvula?.disponivel === true) {
    return 'Disponivel';
  }

  if (valvula?.disponivel === false) {
    return 'Indisponivel';
  }

  return 'Sem status';
}

function getValveTitle(valvula: ValvulaHardware | undefined, fallbackCode: string): string {
  return valvula?.nome ?? valvula?.descricao ?? fallbackCode;
}

export function HardwareReadingsCard({
  reading,
  acoplamento,
  status,
  hardwareStatus,
}: HardwareReadingsCardProps) {
  const readingMessage =
    typeof reading?.valor_vacuo === 'number'
      ? `${reading.valor_vacuo} kPa`
      : 'Ultima leitura nao disponivel';
  const readingDate = formatDateTime(reading?.registrado_em ?? reading?.enviado_em);
  const valvulasByTanque = groupValvulasByTanque([status, hardwareStatus]);

  return (
    <section className={styles.card}>
      <header>
        <div>
          <p>Leitura realtime</p>
          <h2>Sensor e acoplamento</h2>
        </div>
        <Gauge size={18} aria-hidden="true" />
      </header>

      <dl className={styles.grid}>
        <div>
          <dt>Sensor principal</dt>
          <dd>{getSensorLabel(reading)}</dd>
        </div>
        <div>
          <dt>Ultima leitura de vacuo</dt>
          <dd>{readingMessage}</dd>
        </div>
        <div>
          <dt>Data da leitura</dt>
          <dd>{readingDate}</dd>
        </div>
        <div>
          <dt>Acoplamento</dt>
          <dd>{getAcoplamentoLabel(acoplamento)}</dd>
        </div>
      </dl>

      <section className={styles.valveSection} aria-label="Valvulas fixas por tanque">
        <div className={styles.valveTitle}>
          <strong>Valvulas fixas do hardware</strong>
          <span>Duas valvulas por tanque</span>
        </div>

        <div className={styles.valveGrid}>
          {TANQUES_HARDWARE.map((tanque) => {
            const hardware = getTanqueHardwareComValvulas(tanque, valvulasByTanque);
            const principalCode = getExpectedValveCode(tanque, 'PRINCIPAL');
            const auxiliarCode = getExpectedValveCode(tanque, 'AUXILIAR');
            const lines = [
              {
                key: `${tanque}-principal`,
                label: 'Linha principal',
                expectedCode: principalCode,
                valve: hardware.valvulaPrincipal,
                pump: 'BOMBA_VACUO_PRINCIPAL',
              },
              {
                key: `${tanque}-auxiliar`,
                label: 'Linha auxiliar',
                expectedCode: auxiliarCode,
                valve: hardware.valvulaAuxiliar,
                pump: 'BOMBA_VACUO_AUXILIAR',
              },
            ];

            return (
              <article key={tanque} className={styles.tankValves}>
                <h3>{getTanqueHardwareLabel(tanque)}</h3>

                {lines.map((line) => (
                  <div key={line.key} className={line.valve ? undefined : styles.missingValve}>
                    <span>{line.label}</span>
                    <strong>{getValveTitle(line.valve, line.expectedCode)}</strong>
                    <small>Codigo: {line.valve?.codigo_hardware ?? line.expectedCode}</small>
                    <small>Bomba: {line.valve?.bomba_codigo_hardware ?? line.pump}</small>
                    <small>Status: {formatValveOpenState(line.valve)}</small>
                    <small>Disponibilidade: {formatValveAvailability(line.valve)}</small>
                  </div>
                ))}
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
