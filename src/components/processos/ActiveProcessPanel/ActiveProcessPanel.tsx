import type {
  ProcessoAction,
  ProcessoResponse,
  ProcessosPermissions,
  SensorAcoplamentoPayload,
  SensorReadingPayload,
} from '../../../types';
import { ProcessActionsBar } from '../ProcessActionsBar';
import { ProcessMetricsCards } from '../ProcessMetricsCards';
import { ProcessStatusBadge } from '../ProcessStatusBadge';
import styles from './ActiveProcessPanel.module.scss';

type ActiveProcessPanelProps = {
  process: ProcessoResponse | null;
  permissions: ProcessosPermissions;
  loadingAction: ProcessoAction | 'create' | null;
  lastReading?: SensorReadingPayload | null;
  lastAcoplamento?: SensorAcoplamentoPayload | null;
  esp32Online?: boolean | null;
  startBlockedMessage?: string | null;
  onAction: (action: ProcessoAction, process: ProcessoResponse) => void;
  onCreate: () => void;
};

export function ActiveProcessPanel({
  process,
  permissions,
  loadingAction,
  lastReading,
  lastAcoplamento,
  esp32Online,
  startBlockedMessage,
  onAction,
  onCreate,
}: ActiveProcessPanelProps) {
  if (!process) {
    return (
      <section className={styles.panel}>
        <div>
          <p className={styles.overline}>Processo ativo</p>
          <h2>Nenhum processo em execucao no momento.</h2>
          <p className={styles.description}>
            Configure um processo de vacuo para iniciar a operacao quando a API e o perfil
            permitirem.
          </p>
        </div>

        {permissions.canCreateProcess ? (
          <button className={styles.primaryButton} type="button" onClick={onCreate}>
            Novo processo
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Processo ativo</p>
          <h2>{process.nome_processo ?? `Processo #${process.id_processo}`}</h2>
          <p className={styles.description}>
            Acoes operacionais usam endpoints HTTP reais e continuam validadas pelo backend.
          </p>
        </div>
        <ProcessStatusBadge status={process.status_processo} />
      </header>

      <ProcessMetricsCards
        process={process}
        lastReading={lastReading}
        lastAcoplamento={lastAcoplamento}
        esp32Online={esp32Online}
      />

      <ProcessActionsBar
        process={process}
        permissions={permissions}
        loadingAction={loadingAction}
        startBlockedMessage={startBlockedMessage}
        onAction={onAction}
      />
    </section>
  );
}
