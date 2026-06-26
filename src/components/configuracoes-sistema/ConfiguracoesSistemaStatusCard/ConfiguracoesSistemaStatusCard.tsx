import { Clock3, DatabaseZap, ShieldAlert } from 'lucide-react';
import type {
  ConfiguracoesSistemaFormErrors,
  ConfiguracoesSistemaFormState,
  ConfiguracoesSistemaResponse,
  StatusGeralSistema,
} from '../../../types';
import styles from './ConfiguracoesSistemaStatusCard.module.scss';

type ConfiguracoesSistemaStatusCardProps = {
  configuracao: ConfiguracoesSistemaResponse | null;
  formState: ConfiguracoesSistemaFormState;
  errors: ConfiguracoesSistemaFormErrors;
  readOnly: boolean;
  onChange: (field: keyof ConfiguracoesSistemaFormState, value: string) => void;
};

const statusOptions: StatusGeralSistema[] = [
  'OPERACIONAL',
  'MANUTENCAO',
  'ALERTA',
  'FALHA',
  'BLOQUEADO',
];

function formatDate(value?: string): string {
  if (!value) {
    return 'Indisponivel';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function ConfiguracoesSistemaStatusCard({
  configuracao,
  formState,
  errors,
  readOnly,
  onChange,
}: ConfiguracoesSistemaStatusCardProps) {
  return (
    <section className={styles.card}>
      <header>
        <div>
          <p>Status geral</p>
          <h2>Controle do sistema</h2>
        </div>
        <span className={styles.ready}>Sincronizado</span>
      </header>

      <dl className={styles.grid}>
        <div>
          <dt>
            <DatabaseZap size={15} aria-hidden="true" />
            Status atual
          </dt>
          <dd>{configuracao?.status_geral_sistema ?? 'Nao carregado'}</dd>
        </div>
        <div>
          <dt>
            <Clock3 size={15} aria-hidden="true" />
            Ultima atualizacao
          </dt>
          <dd>{formatDate(configuracao?.atualizado_em)}</dd>
        </div>
        <div>
          <dt>
            <ShieldAlert size={15} aria-hidden="true" />
            Responsavel
          </dt>
          <dd>{configuracao?.id_usuario_alteracao ?? 'Indisponivel'}</dd>
        </div>
      </dl>

      <label className={styles.statusField}>
        Status geral editavel
        <select
          value={formState.status_geral_sistema}
          onChange={(event) => onChange('status_geral_sistema', event.target.value)}
          disabled={readOnly}
        >
          <option value="">Selecione</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {errors.status_geral_sistema ? <strong>{errors.status_geral_sistema}</strong> : null}
      </label>
    </section>
  );
}
