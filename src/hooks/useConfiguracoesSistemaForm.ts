import { useCallback, useMemo, useState } from 'react';
import type {
  ConfiguracoesSistemaFormErrors,
  ConfiguracoesSistemaFormState,
  ConfiguracoesSistemaResponse,
  ConfiguracoesSistemaUpdateRequest,
} from '../types';

type UseConfiguracoesSistemaFormResult = {
  formState: ConfiguracoesSistemaFormState;
  errors: ConfiguracoesSistemaFormErrors;
  isDirty: boolean;
  updateField: (field: keyof ConfiguracoesSistemaFormState, value: string) => void;
  resetForm: () => void;
  validate: () => ConfiguracoesSistemaUpdateRequest | null;
};

const emptyFormState: ConfiguracoesSistemaFormState = {
  vacuo_padrao: '',
  limite_seguranca_vacuo: '',
  tolerancia_vacuo_percentual: '',
};

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
  };
}

function parseRequiredNumber(value: string): number | null {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function validateFormState(
  formState: ConfiguracoesSistemaFormState,
): { errors: ConfiguracoesSistemaFormErrors; payload: ConfiguracoesSistemaUpdateRequest | null } {
  const errors: ConfiguracoesSistemaFormErrors = {};
  const vacuoPadrao = parseRequiredNumber(formState.vacuo_padrao);
  const limiteSegurancaVacuo = parseRequiredNumber(formState.limite_seguranca_vacuo);
  const toleranciaVacuoPercentual = parseRequiredNumber(formState.tolerancia_vacuo_percentual);

  if (vacuoPadrao === null || vacuoPadrao < 0) {
    errors.vacuo_padrao = 'Informe um valor numerico valido.';
  }

  if (limiteSegurancaVacuo === null || limiteSegurancaVacuo < 0) {
    errors.limite_seguranca_vacuo = 'Informe um limite numerico valido.';
  }

  if (
    toleranciaVacuoPercentual === null ||
    toleranciaVacuoPercentual < 0 ||
    toleranciaVacuoPercentual > 100
  ) {
    errors.tolerancia_vacuo_percentual = 'Informe uma tolerancia entre 0 e 100%.';
  }

  if (Object.keys(errors).length > 0) {
    return { errors, payload: null };
  }

  return {
    errors,
    payload: {
      vacuo_padrao: vacuoPadrao ?? 0,
      limite_seguranca_vacuo: limiteSegurancaVacuo ?? 0,
      tolerancia_vacuo_percentual: toleranciaVacuoPercentual ?? 0,
    },
  };
}

export function useConfiguracoesSistemaForm(
  configuracao: ConfiguracoesSistemaResponse | null,
): UseConfiguracoesSistemaFormResult {
  const initialFormState = useMemo(() => mapConfigToFormState(configuracao), [configuracao]);
  const [formState, setFormState] = useState<ConfiguracoesSistemaFormState>(initialFormState);
  const [errors, setErrors] = useState<ConfiguracoesSistemaFormErrors>({});

  const isDirty = useMemo(
    () =>
      formState.vacuo_padrao !== initialFormState.vacuo_padrao ||
      formState.limite_seguranca_vacuo !== initialFormState.limite_seguranca_vacuo ||
      formState.tolerancia_vacuo_percentual !== initialFormState.tolerancia_vacuo_percentual,
    [formState, initialFormState],
  );

  const updateField = useCallback(
    (field: keyof ConfiguracoesSistemaFormState, value: string): void => {
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

  const validate = useCallback((): ConfiguracoesSistemaUpdateRequest | null => {
    const result = validateFormState(formState);
    setErrors(result.errors);

    return result.payload;
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
