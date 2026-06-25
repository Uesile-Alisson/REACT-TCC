import { useCallback, useMemo, useState } from 'react';
import {
  getMqttHardwareConfig,
  getMqttHardwareStatus,
  updateMqttHardwareConfig,
} from '../services/mqtt-hardware.service';
import type {
  MqttHardwareConfigResponse,
  MqttHardwareStatusResponse,
  UpdateMqttConfigRequest,
} from '../types';
import { getAuthErrorMessage } from '../utils/authErrors';

type UseConfiguracoesMqttHardwareResult = {
  config: MqttHardwareConfigResponse | null;
  status: MqttHardwareStatusResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  configError: string | null;
  statusError: string | null;
  success: string | null;
  refresh: () => Promise<void>;
  saveConfig: (payload: UpdateMqttConfigRequest) => Promise<boolean>;
  clearFeedback: () => void;
};

export function useConfiguracoesMqttHardware(): UseConfiguracoesMqttHardwareResult {
  const [config, setConfig] = useState<MqttHardwareConfigResponse | null>(null);
  const [status, setStatus] = useState<MqttHardwareStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setConfigError(null);
    setStatusError(null);

    const [configResult, statusResult] = await Promise.allSettled([
      getMqttHardwareConfig(),
      getMqttHardwareStatus(),
    ]);

    if (configResult.status === 'fulfilled') {
      setConfig(configResult.value);
    } else {
      setConfig(null);
      setConfigError(getAuthErrorMessage(configResult.reason));
    }

    if (statusResult.status === 'fulfilled') {
      setStatus(statusResult.value);
    } else {
      setStatus(null);
      setStatusError(getAuthErrorMessage(statusResult.reason));
    }

    setIsLoading(false);
  }, []);

  const saveConfig = useCallback(async (payload: UpdateMqttConfigRequest): Promise<boolean> => {
    setIsSaving(true);
    setConfigError(null);
    setSuccess(null);

    try {
      const updatedConfig = await updateMqttHardwareConfig(payload);
      setConfig(updatedConfig);
      setSuccess('Configuracao MQTT atualizada com sucesso.');
      return true;
    } catch (error: unknown) {
      setConfigError(getAuthErrorMessage(error));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const clearFeedback = useCallback((): void => {
    setSuccess(null);
    setConfigError(null);
    setStatusError(null);
  }, []);

  return useMemo(
    () => ({
      config,
      status,
      isLoading,
      isSaving,
      configError,
      statusError,
      success,
      refresh,
      saveConfig,
      clearFeedback,
    }),
    [
      clearFeedback,
      config,
      configError,
      isLoading,
      isSaving,
      refresh,
      saveConfig,
      status,
      statusError,
      success,
    ],
  );
}
