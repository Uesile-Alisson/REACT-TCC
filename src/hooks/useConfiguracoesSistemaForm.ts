import { useCallback, useMemo, useState } from 'react';
import type {
  ConfiguracoesSistemaFormErrors,
  ConfiguracoesSistemaFormState,
  ConfiguracoesSistemaResponse,
  ConfiguracoesSistemaUpdateRequest,
  StatusGeralSistema,
} from '../types';

type UseConfiguracoesSistemaFormResult = {
  formState: ConfiguracoesSistemaFormState;
  errors: ConfiguracoesSistemaFormErrors;
  isDirty: boolean;
  updateField: (field: keyof ConfiguracoesSistemaFormState, value: string) => void;
  resetForm: () => void;
  validate: () => ConfiguracoesSistemaUpdateRequest | null;
};

type FormDraft = {
  sourceKey: string;
  values: Partial<ConfiguracoesSistemaFormState>;
  errors: ConfiguracoesSistemaFormErrors;
};

type NumericRule = {
  min?: number;
  max?: number;
  integer?: boolean;
  negative?: boolean;
  decimals?: number;
  label: string;
};

const emptyFormState: ConfiguracoesSistemaFormState = {
  tempo_maximo_padrao: '',
  encerramento_automatico: '',
  tempo_estabilizacao_vacuo_segundos: '',
  estabilizacao_cobertura_minima_percentual: '',
  intervalo_leitura_esperado_ms: '',
  timeout_leitura_sensor_ms: '',
  tempo_retencao_vacuo_segundos: '',
  perda_vacuo_maxima_retencao: '',
  limite_seguranca_vacuo: '',
  vacuo_padrao: '',
  quantidade_maxima_tanques: '',
  status_geral_sistema: '',
  versao_sistema: '',
  tolerancia_vacuo_percentual: '',
  estagnacao_janela_segundos: '',
  estagnacao_variacao_minima: '',
  estagnacao_leituras_minimas: '',
  estagnacao_janelas_consecutivas: '',
  estagnacao_tempo_minimo_bomba_principal_segundos: '',
  estagnacao_tempo_maximo_sem_progresso_segundos: '',
  estagnacao_fator_minimo_proximidade_alvo: '',
  auxilio_janela_avaliacao_segundos: '',
  auxilio_melhoria_minima: '',
  auxilio_timeout_segundos: '',
};

const FORM_FIELDS = Object.keys(emptyFormState) as Array<keyof ConfiguracoesSistemaFormState>;

const statusGeralSistemaValues: StatusGeralSistema[] = [
  'OPERACIONAL',
  'MANUTENCAO',
  'ALERTA',
  'FALHA',
  'BLOQUEADO',
];

const numericRules: Partial<Record<keyof ConfiguracoesSistemaFormState, NumericRule>> = {
  tempo_maximo_padrao: { min: 1, integer: true, label: 'tempo maximo padrao' },
  tempo_estabilizacao_vacuo_segundos: { min: 5, max: 3600, integer: true, label: 'tempo de estabilizacao' },
  estabilizacao_cobertura_minima_percentual: { min: 1, max: 100, decimals: 2, label: 'cobertura minima' },
  intervalo_leitura_esperado_ms: { min: 100, max: 60000, integer: true, label: 'intervalo de leitura' },
  timeout_leitura_sensor_ms: { min: 100, max: 120000, integer: true, label: 'timeout do sensor' },
  tempo_retencao_vacuo_segundos: { min: 5, max: 3600, integer: true, label: 'tempo de retencao' },
  perda_vacuo_maxima_retencao: { min: 0, max: 1000, decimals: 3, label: 'perda maxima de vacuo' },
  limite_seguranca_vacuo: { negative: true, decimals: 3, label: 'limite de seguranca' },
  vacuo_padrao: { negative: true, decimals: 3, label: 'vacuo padrao' },
  quantidade_maxima_tanques: { min: 1, integer: true, label: 'quantidade maxima de tanques' },
  tolerancia_vacuo_percentual: { min: 0, max: 100, decimals: 2, label: 'tolerancia de vacuo' },
  estagnacao_janela_segundos: { min: 10, max: 3600, integer: true, label: 'janela de estagnacao' },
  estagnacao_variacao_minima: { min: 0, max: 1000, decimals: 3, label: 'variacao minima de estagnacao' },
  estagnacao_leituras_minimas: { min: 3, max: 1000, integer: true, label: 'leituras minimas de estagnacao' },
  estagnacao_janelas_consecutivas: { min: 1, max: 10, integer: true, label: 'janelas consecutivas' },
  estagnacao_tempo_minimo_bomba_principal_segundos: { min: 0, max: 3600, integer: true, label: 'tempo minimo da bomba principal' },
  estagnacao_tempo_maximo_sem_progresso_segundos: { min: 10, max: 86400, integer: true, label: 'tempo maximo sem progresso' },
  estagnacao_fator_minimo_proximidade_alvo: { min: 0.05, max: 1, decimals: 3, label: 'fator minimo de proximidade' },
  auxilio_janela_avaliacao_segundos: { min: 5, max: 3600, integer: true, label: 'janela de avaliacao do auxilio' },
  auxilio_melhoria_minima: { min: 0.001, max: 1000, decimals: 3, label: 'melhoria minima do auxilio' },
  auxilio_timeout_segundos: { min: 10, max: 86400, integer: true, label: 'timeout do auxilio' },
};

function getSourceKey(configuracao: ConfiguracoesSistemaResponse | null): string {
  return configuracao
    ? `${configuracao.id_configuracao_sistema}:${configuracao.atualizado_em}`
    : 'empty';
}

function mapConfigToFormState(
  configuracao: ConfiguracoesSistemaResponse | null,
): ConfiguracoesSistemaFormState {
  if (!configuracao) {
    return emptyFormState;
  }

  return FORM_FIELDS.reduce<ConfiguracoesSistemaFormState>((state, field) => {
    state[field] = String(configuracao[field]);
    return state;
  }, { ...emptyFormState });
}

function decimalPlaces(value: number): number {
  if (Number.isInteger(value)) return 0;
  const match = value.toString().match(/(?:\.(\d+))?(?:e([+-]?\d+))?$/i);
  const fractionLength = match?.[1]?.length ?? 0;
  const exponent = Number(match?.[2] ?? 0);
  return Math.max(0, fractionLength - exponent);
}

function validateNumericField(
  rawValue: string,
  rule: NumericRule,
): { value: number | null; error?: string } {
  const value = rawValue.trim().length > 0 ? Number(rawValue) : Number.NaN;

  if (!Number.isFinite(value)) {
    return { value: null, error: `Informe ${rule.label}.` };
  }
  if (rule.integer && !Number.isInteger(value)) {
    return { value: null, error: `${rule.label} deve ser um numero inteiro.` };
  }
  if (rule.negative && value >= 0) {
    return { value: null, error: `${rule.label} deve ser negativo em kPa manometrico.` };
  }
  if (rule.min !== undefined && value < rule.min) {
    return { value: null, error: `${rule.label} deve ser no minimo ${rule.min}.` };
  }
  if (rule.max !== undefined && value > rule.max) {
    return { value: null, error: `${rule.label} deve ser no maximo ${rule.max}.` };
  }
  if (rule.decimals !== undefined && decimalPlaces(value) > rule.decimals) {
    return { value: null, error: `${rule.label} aceita ate ${rule.decimals} casas decimais.` };
  }

  return { value };
}

function validateFormState(
  formState: ConfiguracoesSistemaFormState,
  initialFormState: ConfiguracoesSistemaFormState,
): { errors: ConfiguracoesSistemaFormErrors; payload: ConfiguracoesSistemaUpdateRequest | null } {
  const errors: ConfiguracoesSistemaFormErrors = {};
  const numericValues = new Map<keyof ConfiguracoesSistemaFormState, number>();

  Object.entries(numericRules).forEach(([rawField, rule]) => {
    const field = rawField as keyof ConfiguracoesSistemaFormState;
    if (!rule) return;
    const result = validateNumericField(formState[field], rule);
    if (result.error) errors[field] = result.error;
    if (result.value !== null) numericValues.set(field, result.value);
  });

  if (!statusGeralSistemaValues.includes(formState.status_geral_sistema as StatusGeralSistema)) {
    errors.status_geral_sistema = 'Selecione um status valido.';
  }
  if (!['true', 'false'].includes(formState.encerramento_automatico)) {
    errors.encerramento_automatico = 'Selecione se o encerramento sera automatico.';
  }
  if (!formState.versao_sistema.trim() || formState.versao_sistema.trim().length > 30) {
    errors.versao_sistema = 'Informe uma versao com ate 30 caracteres.';
  }

  const interval = numericValues.get('intervalo_leitura_esperado_ms');
  const timeout = numericValues.get('timeout_leitura_sensor_ms');
  if (interval !== undefined && timeout !== undefined && timeout < interval) {
    errors.timeout_leitura_sensor_ms = 'O timeout deve ser maior ou igual ao intervalo esperado.';
  }

  if (Object.keys(errors).length > 0) {
    return { errors, payload: null };
  }

  const payload: ConfiguracoesSistemaUpdateRequest = {};
  FORM_FIELDS.forEach((field) => {
    if (formState[field] === initialFormState[field]) return;

    if (field === 'status_geral_sistema') {
      payload.status_geral_sistema = formState[field] as StatusGeralSistema;
    } else if (field === 'encerramento_automatico') {
      payload.encerramento_automatico = formState[field] === 'true';
    } else if (field === 'versao_sistema') {
      payload.versao_sistema = formState[field].trim();
    } else {
      Object.assign(payload, { [field]: numericValues.get(field) });
    }
  });

  return { errors, payload: Object.keys(payload).length > 0 ? payload : null };
}

export function useConfiguracoesSistemaForm(
  configuracao: ConfiguracoesSistemaResponse | null,
): UseConfiguracoesSistemaFormResult {
  const sourceKey = useMemo(() => getSourceKey(configuracao), [configuracao]);
  const initialFormState = useMemo(() => mapConfigToFormState(configuracao), [configuracao]);
  const [draft, setDraft] = useState<FormDraft>({ sourceKey: 'empty', values: {}, errors: {} });
  const activeDraft = draft.sourceKey === sourceKey ? draft : null;
  const formState = useMemo(
    () => ({ ...initialFormState, ...(activeDraft?.values ?? {}) }),
    [activeDraft?.values, initialFormState],
  );
  const errors = activeDraft?.errors ?? {};
  const isDirty = useMemo(
    () => FORM_FIELDS.some((field) => formState[field] !== initialFormState[field]),
    [formState, initialFormState],
  );

  const updateField = useCallback(
    (field: keyof ConfiguracoesSistemaFormState, value: string): void => {
      setDraft((currentDraft) => {
        const currentValues = currentDraft.sourceKey === sourceKey ? currentDraft.values : {};
        const nextErrors = currentDraft.sourceKey === sourceKey ? { ...currentDraft.errors } : {};
        delete nextErrors[field];
        return { sourceKey, values: { ...currentValues, [field]: value }, errors: nextErrors };
      });
    },
    [sourceKey],
  );

  const resetForm = useCallback((): void => {
    setDraft({ sourceKey, values: {}, errors: {} });
  }, [sourceKey]);

  const validate = useCallback((): ConfiguracoesSistemaUpdateRequest | null => {
    const result = validateFormState(formState, initialFormState);
    setDraft((currentDraft) => ({
      sourceKey,
      values: currentDraft.sourceKey === sourceKey ? currentDraft.values : {},
      errors: result.errors,
    }));
    return result.payload;
  }, [formState, initialFormState, sourceKey]);

  return { formState, errors, isDirty, updateField, resetForm, validate };
}
