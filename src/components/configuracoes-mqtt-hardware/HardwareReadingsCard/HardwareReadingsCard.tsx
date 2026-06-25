import { Gauge } from 'lucide-react';
import type { SensorAcoplamentoPayload, SensorReadingPayload } from '../../../services/realtime';
import { formatDateTime, getAcoplamentoLabel, getSensorLabel } from '../mqttHardwareUtils';
import styles from './HardwareReadingsCard.module.scss';

type HardwareReadingsCardProps = {
  reading: SensorReadingPayload | null;
  acoplamento: SensorAcoplamentoPayload | null;
};

export function HardwareReadingsCard({ reading, acoplamento }: HardwareReadingsCardProps) {
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
          <dd>{typeof reading?.valor_vacuo === 'number' ? `${reading.valor_vacuo} kPa` : 'Indisponivel'}</dd>
        </div>
        <div>
          <dt>Data da leitura</dt>
          <dd>{formatDateTime(reading?.registrado_em ?? reading?.enviado_em)}</dd>
        </div>
        <div>
          <dt>Acoplamento</dt>
          <dd>{getAcoplamentoLabel(acoplamento)}</dd>
        </div>
      </dl>
    </section>
  );
}
