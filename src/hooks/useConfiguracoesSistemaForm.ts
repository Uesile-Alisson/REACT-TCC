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

const emptyFormState: ConfiguracoesSistemaFormState = {
  vacuo_padrao: '',
  limite_seguranca_vacuo: '',
  tolerancia_vacuo_percentual: '',
  status_geral_sistema: '',
};

const statusGeralSistemaValues: StatusGeralSistema[] = [
  'OPERACIONAL',
  'MANUTENCAO',
  'ALERTA',
  'FALHA',
  'BLOQUEADO',
];

function getSourceKey(configuracao: ConfiguracoesSistemaResponse | null): string {
  if (!configuracao) {
    return 'empty';
  }

  return `${configuracao.id_configuracao_sistema}:${configuracao.atualizado_em}`;
}

function mapConfigToFormState(
  configuracao: ConfiguracoesSistemaResponse | null,
): ConfiguracoesSistemaFormState {
  if (!configuracao) {
    return emptyFormState;
  }

  return {
    vacuo_padrao: String(configuracao.vacuo_padrao),
    limite_seguranca_vacuo: String(configuracao.limite_seguranca_vacuo),
    tolerancia_vacuo_percentual: String(configuracao.tolerancia_vacuo_percentual),
    status_geral_sistema: configuracao.status_geral_sistema,
  };
}

function parseRequiredNumber(value: string): number | null {
  if (value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function isStatusGeralSistema(value: string): value is StatusGeralSistema {
  return statusGeralSistemaValues.includes(value as StatusGeralSistema);
}

function validateFormState(
  formState: ConfiguracoesSistemaFormState,
  initialFormState: ConfiguracoesSistemaFormState,
): { errors: ConfiguracoesSistemaFormErrors; payload: ConfiguracoesSistemaUpdateRequest | null } {
  const errors: ConfiguracoesSistemaFormErrors = {};
  const vacuoPadrao = parseRequiredNumber(formState.vacuo_padrao);
  const limiteSegurancaVacuo = parseRequiredNumber(formState.limite_seguranca_vacuo);
  const toleranciaVacuoPercentual = parseRequiredNumber(formState.tolerancia_vacuo_percentual);
  const initialVacuoPadrao = parseRequiredNumber(initialFormState.vacuo_padrao);
  const initialLimiteSegurancaVacuo = parseRequiredNumber(
    initialFormState.limite_seguranca_vacuo,
  );
  const initialToleranciaVacuoPercentual = parseRequiredNumber(
    initialFormState.tolerancia_vacuo_percentual,
  );

  if (vacuoPadrao === null) {
    errors.vacuo_padrao = 'Informe um valor numerico valido.';
  }

  if (limiteSegurancaVacuo === null) {
    errors.limite_seguranca_vacuo = 'Informe um limite numerico valido.';
  }

  if (
    toleranciaVacuoPercentual === null ||
    toleranciaVacuoPercentual < 0 ||
    toleranciaVacuoPercentual > 100
  ) {
    errors.tolerancia_vacuo_percentual = 'Informe uma tolerancia entre 0 e 100%.';
  }

  if (!isStatusGeralSistema(formState.status_geral_sistema)) {
    errors.status_geral_sistema = 'Selecione um status valido.';
  }

  if (Object.keys(errors).length > 0) {
    return { errors, payload: null };
  }

  const payload: ConfiguracoesSistemaUpdateRequest = {};

  if (vacuoPadrao !== initialVacuoPadrao) {
    payload.vacuo_padrao = vacuoPadrao ?? 0;
  }

  if (limiteSegurancaVacuo !== initialLimiteSegurancaVacuo) {
    payload.limite_seguranca_vacuo = limiteSegurancaVacuo ?? 0;
  }

  if (toleranciaVacuoPercentual !== initialToleranciaVacuoPercentual) {
    payload.tolerancia_vacuo_percentual = toleranciaVacuoPercentual ?? 0;
  }

  if (
    formState.status_geral_sistema !== initialFormState.status_geral_sistema &&
    isStatusGeralSistema(formState.status_geral_sistema)
  ) {
    payload.status_geral_sistema = formState.status_geral_sistema;
  }

  return { errors, payload: Object.keys(payload).length > 0 ? payload : null };
}

export function useConfiguracoesSistemaForm(
  configuracao: ConfiguracoesSistemaResponse | null,
): UseConfiguracoesSistemaFormResult {
  const sourceKey = useMemo(() => getSourceKey(configuracao), [configuracao]);
  const initialFormState = useMemo(() => mapConfigToFormState(configuracao), [configuracao]);
  const [draft, setDraft] = useState<FormDraft>({
    sourceKey: 'empty',
    values: {},
    errors: {},
  });

  const activeDraft = draft.sourceKey === sourceKey ? draft : null;
  const formState = useMemo(
    () => ({
      ...initialFormState,
      ...(activeDraft?.values ?? {}),
    }),
    [activeDraft?.values, initialFormState],
  );
  const errors = activeDraft?.errors ?? {};

  const isDirty = useMemo(
    () =>
      formState.vacuo_padrao !== initialFormState.vacuo_padrao ||
      formState.limite_seguranca_vacuo !== initialFormState.limite_seguranca_vacuo ||
      formState.tolerancia_vacuo_percentual !== initialFormState.tolerancia_vacuo_percentual ||
      formState.status_geral_sistema !== initialFormState.status_geral_sistema,
    [formState, initialFormState],
  );

  const updateField = useCallback(
    (field: keyof ConfiguracoesSistemaFormState, value: string): void => {
      setDraft((currentDraft) => {
        const currentValues = currentDraft.sourceKey === sourceKey ? currentDraft.values : {};
        const currentErrors = currentDraft.sourceKey === sourceKey ? currentDraft.errors : {};
        const nextErrors = { ...currentErrors };
        delete nextErrors[field];

        return {
          sourceKey,
          values: {
            ...currentValues,
            [field]: value,
          },
          errors: nextErrors,
        };
      });
    },
    [sourceKey],
  );

  const resetForm = useCallback((): void => {
    setDraft({
      sourceKey,
      values: {},
      errors: {},
    });
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

  return {
    formState,
    errors,
    isDirty,
    updateField,
    resetForm,
    validate,
  };
}
