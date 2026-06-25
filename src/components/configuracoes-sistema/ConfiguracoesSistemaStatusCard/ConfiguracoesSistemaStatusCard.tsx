import { Clock3, DatabaseZap, ShieldAlert } from 'lucide-react';
import type { ConfiguracoesSistemaResponse } from '../../../types';
import styles from './ConfiguracoesSistemaStatusCard.module.scss';

type ConfiguracoesSistemaStatusCardProps = {
  configuracao: ConfiguracoesSistemaResponse | null;
  endpointMissing: boolean;
};

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
  endpointMissing,
}: ConfiguracoesSistemaStatusCardProps) {
  return (
    <section className={styles.card}>
      <header>
        <div>
          <p>Status geral</p>
          <h2>Controle do sistema</h2>
        </div>
        <span className={endpointMissing ? styles.pending : styles.ready}>
          {endpointMissing ? 'Contrato pendente' : 'Sincronizado'}
        </span>
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
    </section>
  );
}
