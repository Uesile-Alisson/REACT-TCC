import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeApiError } from '../api/api-error';
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

function getMqttConfigErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);

  if (!apiError.statusCode) {
    return 'Backend indisponivel. Verifique se a API esta rodando antes de carregar a configuracao MQTT.';
  }

  if (apiError.statusCode === 404) {
    return 'Configuracao MQTT nao encontrada. Cadastre ou ative uma configuracao no backend.';
  }

  if (apiError.statusCode === 401 || apiError.statusCode === 403) {
    return 'Usuario sem permissao para consultar a configuracao MQTT.';
  }

  return apiError.message || 'Nao foi possivel carregar a configuracao MQTT.';
}

function getMqttStatusErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);

  if (!apiError.statusCode) {
    return 'Backend indisponivel para consulta de status. Confirme a API antes de validar broker ou ESP32.';
  }

  if (apiError.statusCode === 404) {
    return 'Endpoint de status MQTT nao retornou dados. Verifique se existe configuracao MQTT ativa.';
  }

  if (apiError.statusCode >= 500) {
    return 'Status MQTT indisponivel no backend. Broker, Mosquitto ou servico MQTT podem estar desconectados.';
  }

  return apiError.message || 'Nao foi possivel carregar o status MQTT/Hardware.';
}

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
      setConfigError(getMqttConfigErrorMessage(configResult.reason));
    }

    if (statusResult.status === 'fulfilled') {
      setStatus(statusResult.value);
    } else {
      setStatus(null);
      setStatusError(getMqttStatusErrorMessage(statusResult.reason));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

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
      setConfigError(getMqttConfigErrorMessage(error));
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
