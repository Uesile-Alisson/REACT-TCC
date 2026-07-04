import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlarmeActionErrorMessage } from '../../../services/alarmes.service';
import type { AlarmeResponse } from '../../../types';
import { useAlarmContext } from '../../../hooks/useAlarmContext';
import { useAlarmePermissions } from '../../../hooks/useAlarmePermissions';
import { AlarmPopup } from '../AlarmPopup';
import styles from './AlarmPopupHost.module.scss';

const VISIBLE_INTERVAL_MS = 10000;
const HIDDEN_INTERVAL_MS = 5000;

function isPopupEligible(alarm: AlarmeResponse): boolean {
  return alarm.status_alarme === 'ATIVO' && (alarm.severidade === 'MEDIO' || alarm.severidade === 'CRITICO');
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
    return a.severidade === 'CRITICO' ? -1 : 1;
  }

  return getAlarmTime(b) - getAlarmTime(a);
}

export function AlarmPopupHost() {
  const {
    activeAlarms,
    acknowledgeAlarm,
    resolveAlarm,
  } = useAlarmContext();
  const permissions = useAlarmePermissions();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const popupAlarms = useMemo(
    () => activeAlarms.filter(isPopupEligible).slice().sort(sortPopupAlarms),
    [activeAlarms],
  );
  const primaryAlarm = popupAlarms[0] ?? null;
  const counts = useMemo(
    () => ({
      critical: popupAlarms.filter((alarm) => alarm.severidade === 'CRITICO').length,
      medium: popupAlarms.filter((alarm) => alarm.severidade === 'MEDIO').length,
    }),
    [popupAlarms],
  );

  useEffect(() => {
    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) {
        return;
      }

      setFeedback(null);
      setError(null);
      setIsVisible(true);
    });

    return () => {
      isActive = false;
    };
  }, [primaryAlarm?.id_alarme]);

  useEffect(() => {
    if (!primaryAlarm) {
      return undefined;
    }

    const delay = isVisible ? VISIBLE_INTERVAL_MS : HIDDEN_INTERVAL_MS;
    const timer = window.setTimeout(() => {
      setIsVisible((currentVisibility) => !currentVisibility);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isVisible, primaryAlarm]);

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
    setIsVisible(false);
  }, []);

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
        {primaryAlarm && isVisible ? (
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
            onClose={handleCloseCurrentCycle}
            onAcknowledge={(alarm) => void handleAcknowledge(alarm)}
            onResolve={(alarm) => void handleResolve(alarm)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
