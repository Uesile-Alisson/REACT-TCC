import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  acknowledgeAlarm as acknowledgeAlarmRequest,
  getActiveAlarms,
  getAlarmById,
  getAlarmeActionErrorMessage,
  resolveAlarm as resolveAlarmRequest,
} from '../../services/alarmes.service';
import {
  realtimeService,
  type AlarmAcknowledgedPayload,
  type AlarmCreatedPayload,
  type AlarmNormalizedPayload,
  type AlarmRecoveryAttemptPayload,
  type AlarmResolvedPayload,
  type AlarmUpdatedPayload,
} from '../../services/realtime';
import type { AlarmeListResponse, AlarmeResponse } from '../../types';
import { AlarmContext, type AlarmContextData } from './AlarmContext';

type AlarmProviderProps = {
  children: ReactNode;
};

type AlarmRegistry = Record<string, AlarmeResponse>;

const ACTIVE_ALARMS_LIMIT = 100;
const ACKNOWLEDGEMENT_MESSAGE =
  'Reconhecimento registrado. O alarme continua ativo ate normalizacao tecnica.';

function getAlarmKey(idAlarme: number): string {
  return String(idAlarme);
}

function isActiveAlarm(alarme: Pick<AlarmeResponse, 'status_alarme' | 'excluido_em'>): boolean {
  return alarme.status_alarme === 'ATIVO' && !alarme.excluido_em;
}

function getListItems(response: AlarmeListResponse): AlarmeResponse[] {
  return Array.isArray(response) ? response : response.data;
}

function toAlarmFromCreatedPayload(payload: AlarmCreatedPayload): AlarmeResponse | null {
  if (typeof payload.id_alarme !== 'number') {
    return null;
  }

  return {
    id_alarme: payload.id_alarme,
    severidade: payload.severidade ?? 'INFO',
    status_alarme: payload.status_alarme ?? 'ATIVO',
    titulo: payload.titulo ?? payload.title,
    descricao: payload.descricao ?? payload.description,
    mensagem: payload.mensagem ?? payload.descricao ?? payload.description,
    tipo_alarme: payload.tipo_alarme,
    origem_alarme: payload.origem_alarme,
    valor_detectado: payload.valor_detectado,
    unidade: payload.unidade,
    ocorrido_em: payload.ocorrido_em ?? payload.enviado_em ?? payload.criado_em ?? payload.created_at,
    criado_em: payload.criado_em ?? payload.created_at ?? payload.enviado_em,
    normalizado_em: payload.normalizado_em,
    resolvido_em: payload.resolvido_em,
    bloqueante: payload.bloqueante,
    requer_intervencao: payload.requer_intervencao,
    recuperacao_automatica: payload.recuperacao_automatica,
    tentativas_recuperacao: payload.tentativas_recuperacao,
    reconhecido: payload.reconhecido,
    ultimo_reconhecimento_em: payload.ultimo_reconhecimento_em,
    id_processo: payload.id_processo,
    id_processo_tanque: payload.id_processo_tanque,
    id_processo_tanque_sensor: payload.id_processo_tanque_sensor,
    id_mqtt_mensagem: payload.id_mqtt_mensagem,
  };
}

function getPayloadAlarmId(
  payload:
    | AlarmAcknowledgedPayload
    | AlarmUpdatedPayload
    | AlarmNormalizedPayload
    | AlarmResolvedPayload
    | AlarmRecoveryAttemptPayload,
): number | null {
  return typeof payload.id_alarme === 'number' ? payload.id_alarme : null;
}

export function AlarmProvider({ children }: AlarmProviderProps) {
  const [activeAlarmsById, setActiveAlarmsById] = useState<AlarmRegistry>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(false);

  const removeAlarm = useCallback((idAlarme: number): void => {
    setActiveAlarmsById((currentAlarms) => {
      const key = getAlarmKey(idAlarme);

      if (!currentAlarms[key]) {
        return currentAlarms;
      }

      const nextAlarms = { ...currentAlarms };
      delete nextAlarms[key];

      return nextAlarms;
    });
  }, []);

  const upsertAlarm = useCallback((alarme: AlarmeResponse): void => {
    if (!isActiveAlarm(alarme)) {
      removeAlarm(alarme.id_alarme);
      return;
    }

    setActiveAlarmsById((currentAlarms) => ({
      ...currentAlarms,
      [getAlarmKey(alarme.id_alarme)]: {
        ...currentAlarms[getAlarmKey(alarme.id_alarme)],
        ...alarme,
      },
    }));
  }, [removeAlarm]);

  const syncAlarmById = useCallback(
    async (idAlarme: number): Promise<void> => {
      try {
        const alarme = await getAlarmById(idAlarme);

        if (!isMountedRef.current) {
          return;
        }

        upsertAlarm(alarme);
      } catch (error: unknown) {
        if (!isMountedRef.current) {
          return;
        }

        setLastError(getAlarmeActionErrorMessage(error));
      }
    },
    [upsertAlarm],
  );

  const refreshActiveAlarms = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setLastError(null);

    try {
      const response = await getActiveAlarms({
        page: 1,
        limit: ACTIVE_ALARMS_LIMIT,
        apenas_ativos: true,
        order_by: 'ocorrido_em',
        order_direction: 'desc',
      });
      const activeAlarms = getListItems(response).filter(isActiveAlarm);

      if (!isMountedRef.current) {
        return;
      }

      setActiveAlarmsById(
        activeAlarms.reduce<AlarmRegistry>((registry, alarme) => {
          registry[getAlarmKey(alarme.id_alarme)] = alarme;
          return registry;
        }, {}),
      );
    } catch (error: unknown) {
      if (isMountedRef.current) {
        setLastError(getAlarmeActionErrorMessage(error));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const acknowledgeAlarm = useCallback(
    async (idAlarme: number, observacao?: string): Promise<string> => {
      const result = await acknowledgeAlarmRequest(idAlarme, {
        observacao: observacao?.trim() || undefined,
      });

      await syncAlarmById(idAlarme);

      return result.message || ACKNOWLEDGEMENT_MESSAGE;
    },
    [syncAlarmById],
  );

  const resolveAlarm = useCallback(
    async (idAlarme: number, observacao?: string): Promise<string> => {
      const result = await resolveAlarmRequest(idAlarme, {
        observacao: observacao?.trim() || undefined,
      });

      removeAlarm(idAlarme);

      return result.message || 'Alarme resolvido com sucesso.';
    },
    [removeAlarm],
  );

  useEffect(() => {
    isMountedRef.current = true;
    queueMicrotask(() => {
      if (isMountedRef.current) {
        void refreshActiveAlarms();
      }
    });

    const unsubscribeAlarmCreated = realtimeService.onAlarmCreated((payload: AlarmCreatedPayload) => {
      const alarm = toAlarmFromCreatedPayload(payload);

      if (!alarm) {
        return;
      }

      upsertAlarm(alarm);
      void syncAlarmById(alarm.id_alarme);
    });

    const syncEventAlarm = (
      payload:
        | AlarmAcknowledgedPayload
        | AlarmUpdatedPayload
        | AlarmRecoveryAttemptPayload,
    ): void => {
      const idAlarme = getPayloadAlarmId(payload);

      if (idAlarme) {
        void syncAlarmById(idAlarme);
      }
    };

    const removeEventAlarm = (
      payload: AlarmNormalizedPayload | AlarmResolvedPayload,
    ): void => {
      const idAlarme = getPayloadAlarmId(payload);

      if (idAlarme) {
        removeAlarm(idAlarme);
      }
    };

    const unsubscribeAlarmUpdated = realtimeService.onAlarmUpdated(syncEventAlarm);
    const unsubscribeAlarmAcknowledged = realtimeService.onAlarmAcknowledged(syncEventAlarm);
    const unsubscribeAlarmRecoveryAttempt = realtimeService.onAlarmRecoveryAttempt(syncEventAlarm);
    const unsubscribeAlarmNormalized = realtimeService.onAlarmNormalized(removeEventAlarm);
    const unsubscribeAlarmResolved = realtimeService.onAlarmResolved(removeEventAlarm);

    return () => {
      isMountedRef.current = false;
      unsubscribeAlarmCreated();
      unsubscribeAlarmUpdated();
      unsubscribeAlarmAcknowledged();
      unsubscribeAlarmRecoveryAttempt();
      unsubscribeAlarmNormalized();
      unsubscribeAlarmResolved();
    };
  }, [refreshActiveAlarms, removeAlarm, syncAlarmById, upsertAlarm]);

  const activeAlarms = useMemo(
    () => Object.values(activeAlarmsById),
    [activeAlarmsById],
  );

  const value = useMemo<AlarmContextData>(
    () => ({
      activeAlarms,
      isLoading,
      lastError,
      acknowledgeAlarm,
      resolveAlarm,
      refreshActiveAlarms,
    }),
    [
      acknowledgeAlarm,
      activeAlarms,
      isLoading,
      lastError,
      refreshActiveAlarms,
      resolveAlarm,
    ],
  );

  return <AlarmContext.Provider value={value}>{children}</AlarmContext.Provider>;
}
