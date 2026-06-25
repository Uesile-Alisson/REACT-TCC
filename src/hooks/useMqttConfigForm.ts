import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  MqttConfigFormErrors,
  MqttConfigFormPayloadResult,
  MqttConfigFormState,
  MqttHardwareConfigResponse,
} from '../types';

type UseMqttConfigFormResult = {
  formState: MqttConfigFormState;
  errors: MqttConfigFormErrors;
  isDirty: boolean;
  updateField: (field: keyof MqttConfigFormState, value: string | boolean) => void;
  resetForm: () => void;
  validate: () => MqttConfigFormPayloadResult | null;
};

type MqttTopicField =
  | 'topico_leituras'
  | 'topico_comandos'
  | 'topico_status'
  | 'topico_alarmes'
  | 'topico_heartbeat'
  | 'topico_acoplamentos';

const emptyFormState: MqttConfigFormState = {
  broker_url: '',
  porta: '',
  usuario_mqtt: '',
  senha_mqtt: '',
  topico_leituras: '',
  topico_comandos: '',
  topico_status: '',
  topico_alarmes: '',
  topico_heartbeat: '',
  topico_acoplamentos: '',
  reconexao_automatica: true,
  timeout_comunicacao: '',
  ativo: true,
};

function mapConfigToFormState(config: MqttHardwareConfigResponse | null): MqttConfigFormState {
  if (!config) {
    return emptyFormState;
  }

  return {
    broker_url: config.broker_url ?? '',
    porta: config.porta ? String(config.porta) : '',
    usuario_mqtt: config.usuario_mqtt ?? '',
    senha_mqtt: '',
    topico_leituras: config.topico_leituras ?? '',
    topico_comandos: config.topico_comandos ?? '',
    topico_status: config.topico_status ?? '',
    topico_alarmes: config.topico_alarmes ?? '',
    topico_heartbeat: config.topico_heartbeat ?? '',
    topico_acoplamentos: config.topico_acoplamentos ?? '',
    reconexao_automatica: config.reconexao_automatica ?? true,
    timeout_comunicacao: config.timeout_comunicacao ? String(config.timeout_comunicacao) : '',
    ativo: config.ativo ?? true,
  };
}

function parseInteger(value: string): number | null {
  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : null;
}

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

function hasInvalidTopicSpacing(value: string): boolean {
  return /\s/.test(value.trim());
}

function validateTopic(
  field: MqttTopicField,
  value: string,
  errors: MqttConfigFormErrors,
): void {
  if (isBlank(value)) {
    errors[field] = 'Informe um topico valido.';
    return;
  }

  if (value.trim() === '/' || hasInvalidTopicSpacing(value)) {
    errors[field] = 'Topico nao pode ser vazio, apenas "/" ou conter espacos.';
  }
}

export function useMqttConfigForm(config: MqttHardwareConfigResponse | null): UseMqttConfigFormResult {
  const initialFormState = useMemo(() => mapConfigToFormState(config), [config]);
  const [formState, setFormState] = useState<MqttConfigFormState>(initialFormState);
  const [errors, setErrors] = useState<MqttConfigFormErrors>({});

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFormState(initialFormState);
      setErrors({});
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [initialFormState]);

  const isDirty = useMemo(
    () =>
      formState.broker_url !== initialFormState.broker_url ||
      formState.porta !== initialFormState.porta ||
      formState.usuario_mqtt !== initialFormState.usuario_mqtt ||
      formState.senha_mqtt.length > 0 ||
      formState.topico_leituras !== initialFormState.topico_leituras ||
      formState.topico_comandos !== initialFormState.topico_comandos ||
      formState.topico_status !== initialFormState.topico_status ||
      formState.topico_alarmes !== initialFormState.topico_alarmes ||
      formState.topico_heartbeat !== initialFormState.topico_heartbeat ||
      formState.topico_acoplamentos !== initialFormState.topico_acoplamentos ||
      formState.reconexao_automatica !== initialFormState.reconexao_automatica ||
      formState.timeout_comunicacao !== initialFormState.timeout_comunicacao ||
      formState.ativo !== initialFormState.ativo,
    [formState, initialFormState],
  );

  const updateField = useCallback(
    (field: keyof MqttConfigFormState, value: string | boolean): void => {
      setFormState((currentState) => ({
        ...currentState,
        [field]: value,
      }));
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
      }));
    },
    [],
  );

  const resetForm = useCallback((): void => {
    setFormState(initialFormState);
    setErrors({});
  }, [initialFormState]);

  const validate = useCallback((): MqttConfigFormPayloadResult | null => {
    const nextErrors: MqttConfigFormErrors = {};
    const brokerUrl = formState.broker_url.trim();
    const usuarioMqtt = formState.usuario_mqtt.trim();
    const porta = parseInteger(formState.porta);
    const timeoutComunicacao = parseInteger(formState.timeout_comunicacao);
    const topicFields: MqttTopicField[] = [
      'topico_leituras',
      'topico_comandos',
      'topico_status',
      'topico_alarmes',
      'topico_heartbeat',
      'topico_acoplamentos',
    ];
    const topicValues = topicFields.map((field) => formState[field].trim());
    const duplicateTopic = topicValues.find(
      (topic, index) => topic.length > 0 && topicValues.indexOf(topic) !== index,
    );

    if (brokerUrl.length === 0) {
      nextErrors.broker_url = 'Informe o broker MQTT.';
    }

    if (!porta || porta < 1 || porta > 65535) {
      nextErrors.porta = 'Informe uma porta entre 1 e 65535.';
    }

    if (!timeoutComunicacao || timeoutComunicacao < 1000) {
      nextErrors.timeout_comunicacao = 'Informe timeout minimo de 1000 ms.';
    }

    topicFields.forEach((field) => validateTopic(field, formState[field], nextErrors));

    if (duplicateTopic) {
      topicFields.forEach((field) => {
        if (formState[field].trim() === duplicateTopic) {
          nextErrors[field] = 'Topicos duplicados nao sao recomendados.';
        }
      });
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !porta || !timeoutComunicacao) {
      return null;
    }

    return {
      payload: {
        broker_url: brokerUrl,
        porta,
        usuario_mqtt: usuarioMqtt || undefined,
        senha_mqtt: formState.senha_mqtt.trim() || undefined,
        topico_leituras: formState.topico_leituras.trim(),
        topico_comandos: formState.topico_comandos.trim(),
        topico_status: formState.topico_status.trim(),
        topico_alarmes: formState.topico_alarmes.trim(),
        topico_heartbeat: formState.topico_heartbeat.trim(),
        topico_acoplamentos: formState.topico_acoplamentos.trim(),
        reconexao_automatica: formState.reconexao_automatica,
        timeout_comunicacao: timeoutComunicacao,
        ativo: formState.ativo,
      },
      hasPasswordChange: formState.senha_mqtt.trim().length > 0,
    };
  }, [formState]);

  return {
    formState,
    errors,
    isDirty,
    updateField,
    resetForm,
    validate,
  };
}
