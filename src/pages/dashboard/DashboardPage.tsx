import { RefreshCw } from 'lucide-react';
import { ActiveProcessCard } from '../../components/dashboard/ActiveProcessCard';
import { LastProcessCard } from '../../components/dashboard/LastProcessCard';
import { RecentAlarmsPanel } from '../../components/dashboard/RecentAlarmsPanel';
import { SystemOverviewCards } from '../../components/dashboard/SystemOverviewCards';
import { SystemStatusPanel } from '../../components/dashboard/SystemStatusPanel';
import { useAcoplamentoRealtime } from '../../hooks/useAcoplamentoRealtime';
import { useAlarmesRealtime } from '../../hooks/useAlarmesRealtime';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useMqttHardwareRealtime } from '../../hooks/useMqttHardwareRealtime';
import { useSensorReadingsRealtime } from '../../hooks/useSensorReadingsRealtime';
import styles from './DashboardPage.module.scss';

export function DashboardPage() {
  const { data, error, isLoading, partialErrors, refresh } = useDashboardData();
  const {
    isConnected: isRealtimeConnected,
    isConnecting: isRealtimeConnecting,
    lastError: realtimeError,
    mqttConnectionStatus,
    esp32Online,
    lastHeartbeat,
    eventsCount,
  } = useMqttHardwareRealtime();
  const { lastSensorReading } = useSensorReadingsRealtime();
  const { lastAlarm } = useAlarmesRealtime();
  const { lastAcoplamento } = useAcoplamentoRealtime();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>TSEA / Tela inicial autenticada</p>
          <h1>Dashboard TSEA</h1>
          <p>
            Visao geral do sistema de vacuo com estado inicial via API e atualizacoes em tempo real
            quando disponiveis.
          </p>
        </div>

        <button
          className={styles.refreshButton}
          type="button"
          onClick={() => void refresh()}
          disabled={isLoading}
        >
          <RefreshCw size={16} aria-hidden="true" />
          {isLoading ? 'Atualizando' : 'Atualizar'}
        </button>
      </header>

      {error ? (
        <section className={styles.errorState} role="alert">
          <strong>Nao foi possivel carregar o Dashboard TSEA.</strong>
          <span>{error}</span>
        </section>
      ) : null}

      {isLoading ? (
        <section className={styles.loadingGrid} aria-label="Carregando dashboard">
          <span />
          <span />
          <span />
          <span />
        </section>
      ) : null}

      <SystemOverviewCards
        data={data}
        realtimeConnected={isRealtimeConnected}
        realtimeConnecting={isRealtimeConnecting}
      />

      <section className={styles.primaryGrid}>
        {data.activeProcess ? (
          <ActiveProcessCard
            process={data.activeProcess}
            activeAlarms={data.alarmsSummary?.ativos ?? null}
            lastSensorReading={lastSensorReading}
            partialError={partialErrors.activeProcess}
          />
        ) : (
          <LastProcessCard process={data.lastProcess} partialError={partialErrors.lastProcess} />
        )}

        <SystemStatusPanel
          hardwareStatus={data.hardwareStatus}
          mqttRealtimeStatus={mqttConnectionStatus}
          isRealtimeConnected={isRealtimeConnected}
          isRealtimeConnecting={isRealtimeConnecting}
          esp32Online={esp32Online}
          lastHeartbeat={lastHeartbeat}
          lastSensorReading={lastSensorReading}
          lastAcoplamento={lastAcoplamento}
          eventsCount={eventsCount}
          partialError={partialErrors.hardware}
          realtimeError={realtimeError}
        />
      </section>

      <section className={styles.secondaryGrid}>
        <RecentAlarmsPanel
          summary={data.alarmsSummary}
          recentAlarms={data.recentAlarms}
          lastRealtimeAlarm={lastAlarm}
          partialError={partialErrors.alarms}
        />

        <article className={styles.contextPanel}>
          <p className={styles.overline}>Resumo historico</p>
          <h2>Indicadores disponiveis</h2>
          <dl>
            <div>
              <dt>Processos recentes</dt>
              <dd>{data.historySummary?.processos ? 'Disponivel' : 'Pendente'}</dd>
            </div>
            <div>
              <dt>Alarmes historicos</dt>
              <dd>{data.historySummary?.alarmes ? 'Disponivel' : 'Pendente'}</dd>
            </div>
            <div>
              <dt>Relatorios catalogados</dt>
              <dd>{data.reportsCount ?? 'Pendente'}</dd>
            </div>
            <div>
              <dt>Ultima atualizacao</dt>
              <dd>{data.updatedAt ? new Date(data.updatedAt).toLocaleString('pt-BR') : 'Pendente'}</dd>
            </div>
          </dl>
          {partialErrors.history ? <p className={styles.partialError}>{partialErrors.history}</p> : null}
          {partialErrors.reports ? <p className={styles.partialError}>{partialErrors.reports}</p> : null}
        </article>
      </section>
    </main>
  );
}
