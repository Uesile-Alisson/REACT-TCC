import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlarmeActionErrorMessage } from '../../../services/alarmes.service';
import type { AlarmeResponse } from '../../../types';
import { useAlarmContext } from '../../../hooks/useAlarmContext';
import { useAlarmePermissions } from '../../../hooks/useAlarmePermissions';
import { AlarmPopup } from '../AlarmPopup';
import styles from './AlarmPopupHost.module.scss';

const INFO_VISIBLE_INTERVAL_MS = 5000;
const MEDIUM_VISIBLE_INTERVAL_MS = 9000;
const MEDIUM_REAPPEAR_INTERVAL_MS = 12000;
const CRITICAL_REAPPEAR_INTERVAL_MS = 5000;

type AlarmVisibilityRegistry = Record<string, number>;
type DismissedInfoRegistry = Record<string, true>;

const SEVERITY_PRIORITY: Record<AlarmeResponse['severidade'], number> = {
  CRITICO: 0,
  MEDIO: 1,
  INFO: 2,
};

function isPopupEligible(alarm: AlarmeResponse): boolean {
  return alarm.status_alarme === 'ATIVO' && !alarm.excluido_em;
}

function getAlarmKey(alarm: AlarmeResponse): string {
  return String(alarm.id_alarme);
}

function getAlarmTime(alarm: AlarmeResponse): number {
  const value = alarm.ocorrido_em ?? alarm.criado_em;

  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortPopupAlarms(a: AlarmeResponse, b: AlarmeResponse): number {
  if (a.severidade !== b.severidade) {
    return SEVERITY_PRIORITY[a.severidade] - SEVERITY_PRIORITY[b.severidade];
  }

  return getAlarmTime(b) - getAlarmTime(a);
}

function getVisibleInterval(alarm: AlarmeResponse): number | null {
  if (alarm.severidade === 'CRITICO') {
    return null;
  }

  return alarm.severidade === 'INFO' ? INFO_VISIBLE_INTERVAL_MS : MEDIUM_VISIBLE_INTERVAL_MS;
}

function getHiddenInterval(alarm: AlarmeResponse): number {
  return alarm.severidade === 'CRITICO' ? CRITICAL_REAPPEAR_INTERVAL_MS : MEDIUM_REAPPEAR_INTERVAL_MS;
}

export function AlarmPopupHost() {
  const {
    activeAlarms,
    acknowledgeAlarm,
    resolveAlarm,
  } = useAlarmContext();
  const permissions = useAlarmePermissions();
  const navigate = useNavigate();
  const [hiddenUntilById, setHiddenUntilById] = useState<AlarmVisibilityRegistry>({});
  const [dismissedInfoById, setDismissedInfoById] = useState<DismissedInfoRegistry>({});
  const [clock, setClock] = useState<number>(() => Date.now());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const activePopupAlarms = useMemo(
    () => activeAlarms.filter(isPopupEligible).slice().sort(sortPopupAlarms),
    [activeAlarms],
  );
  const popupAlarms = useMemo(
    () =>
      activePopupAlarms.filter((alarm) => {
        const key = getAlarmKey(alarm);
        const hiddenUntil = hiddenUntilById[key] ?? 0;

        if (alarm.severidade === 'INFO' && dismissedInfoById[key]) {
          return false;
        }

        return hiddenUntil <= clock;
      }),
    [activePopupAlarms, clock, dismissedInfoById, hiddenUntilById],
  );
  const primaryAlarm = popupAlarms[0] ?? null;
  const primaryAlarmKey = primaryAlarm ? getAlarmKey(primaryAlarm) : null;
  const counts = useMemo(
    () => ({
      critical: activePopupAlarms.filter((alarm) => alarm.severidade === 'CRITICO').length,
      medium: activePopupAlarms.filter((alarm) => alarm.severidade === 'MEDIO').length,
      info: activePopupAlarms.filter((alarm) => alarm.severidade === 'INFO').length,
    }),
    [activePopupAlarms],
  );

  const hideAlarmForCycle = useCallback((alarm: AlarmeResponse): void => {
    const key = getAlarmKey(alarm);

    if (alarm.severidade === 'INFO') {
      setDismissedInfoById((currentDismissed) => ({ ...currentDismissed, [key]: true }));
      setHiddenUntilById((currentHidden) => {
        if (!currentHidden[key]) {
          return currentHidden;
        }

        const nextHidden = { ...currentHidden };
        delete nextHidden[key];
        return nextHidden;
      });
      return;
    }

    const hiddenUntil = Date.now() + getHiddenInterval(alarm);

    setHiddenUntilById((currentHidden) => ({ ...currentHidden, [key]: hiddenUntil }));
    setClock(Date.now());
  }, []);

  useEffect(() => {
    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) {
        return;
      }

      const activeKeys = new Set(activePopupAlarms.map(getAlarmKey));
      const now = Date.now();

      setHiddenUntilById((currentHidden) => {
        let changed = false;
        const nextHidden: AlarmVisibilityRegistry = {};

        Object.entries(currentHidden).forEach(([key, hiddenUntil]) => {
          if (activeKeys.has(key) && hiddenUntil > now) {
            nextHidden[key] = hiddenUntil;
            return;
          }

          changed = true;
        });

        return changed ? nextHidden : currentHidden;
      });
    });

    return () => {
      isActive = false;
    };
  }, [activePopupAlarms]);

  useEffect(() => {
    const nextExpiration = Object.values(hiddenUntilById)
      .filter((hiddenUntil) => hiddenUntil > clock)
      .sort((current, next) => current - next)[0];

    if (!nextExpiration) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setClock(Date.now());
    }, Math.max(nextExpiration - clock, 0));

    return () => {
      window.clearTimeout(timer);
    };
  }, [clock, hiddenUntilById]);

  useEffect(() => {
    if (!primaryAlarm) {
      return undefined;
    }

    const visibleInterval = getVisibleInterval(primaryAlarm);

    if (visibleInterval === null) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      hideAlarmForCycle(primaryAlarm);
    }, visibleInterval);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hideAlarmForCycle, primaryAlarm]);

  useEffect(() => {
    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) {
        return;
      }

      setFeedback(null);
      setError(null);
    });

    return () => {
      isActive = false;
    };
  }, [primaryAlarmKey]);

  const handleViewDetails = useCallback(
    (alarm: AlarmeResponse): void => {
      navigate('/alarmes', {
        state: {
          selectedAlarmeId: alarm.id_alarme,
        },
      });
    },
    [navigate],
  );

  const handleViewAll = useCallback((): void => {
    navigate('/alarmes');
  }, [navigate]);

  const handleCloseCurrentCycle = useCallback((): void => {
    if (!primaryAlarm) {
      return;
    }

    hideAlarmForCycle(primaryAlarm);
  }, [hideAlarmForCycle, primaryAlarm]);

  const handleAcknowledge = useCallback(
    async (alarm: AlarmeResponse): Promise<void> => {
      setAcknowledgingId(alarm.id_alarme);
      setError(null);

      try {
        const message = await acknowledgeAlarm(alarm.id_alarme);
        setFeedback(
          message || 'Reconhecimento registrado. O alarme continua ativo ate normalizacao tecnica.',
        );
      } catch (acknowledgeError: unknown) {
        setError(getAlarmeActionErrorMessage(acknowledgeError));
      } finally {
        setAcknowledgingId(null);
      }
    },
    [acknowledgeAlarm],
  );

  const handleResolve = useCallback(
    async (alarm: AlarmeResponse): Promise<void> => {
      setResolvingId(alarm.id_alarme);
      setError(null);

      try {
        const message = await resolveAlarm(alarm.id_alarme);
        setFeedback(message);
      } catch (resolveError: unknown) {
        setError(getAlarmeActionErrorMessage(resolveError));
      } finally {
        setResolvingId(null);
      }
    },
    [resolveAlarm],
  );

  return (
    <div className={styles.host} aria-live="polite">
      <AnimatePresence>
        {primaryAlarm ? (
          <AlarmPopup
            key={primaryAlarm.id_alarme}
            alarm={primaryAlarm}
            counts={counts}
            permissions={permissions}
            feedback={feedback}
            error={error}
            isAcknowledging={acknowledgingId === primaryAlarm.id_alarme}
            isResolving={resolvingId === primaryAlarm.id_alarme}
            onViewDetails={handleViewDetails}
            onViewAll={handleViewAll}
            onClose={primaryAlarm.severidade === 'CRITICO' ? undefined : handleCloseCurrentCycle}
            onAcknowledge={(alarm) => void handleAcknowledge(alarm)}
            onResolve={(alarm) => void handleResolve(alarm)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
