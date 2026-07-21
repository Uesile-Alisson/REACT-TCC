import axios, { AxiosError } from 'axios';
import type { ApiErrorPayload, ApiValidationError } from '../types/common.types';

const DEFAULT_ERROR_MESSAGE = 'Nao foi possivel concluir a solicitacao.';

export class ApiError extends Error {
  statusCode?: number;
  code?: string;
  operationalBlockers: string[];
  validationErrors: ApiValidationError[];
  details?: ApiErrorPayload;
  originalError?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    validationErrors: ApiValidationError[] = [],
    originalError?: unknown,
    details?: ApiErrorPayload,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = details?.code;
    this.operationalBlockers = details?.bloqueios_operacionais ?? [];
    this.validationErrors = validationErrors;
    this.details = details;
    this.originalError = originalError;
  }
}

const OPERATIONAL_BLOCKER_LABELS: Record<string, string> = {
  PROCESS_ACTIVE_OR_PAUSED: 'há um processo ativo ou pausado',
  PROCESS_STARTUP_IN_PROGRESS: 'a partida do processo está em andamento',
  GENERAL_CLOSURE_IN_PROGRESS: 'o encerramento geral está em andamento',
  TANK_LIFECYCLE_ACTIVE: 'há ciclo de vida de tanque ativo',
  TANK_CLOSURE_IN_PROGRESS: 'há encerramento individual de tanque em andamento',
  EMERGENCY_STOP_UNCONFIRMED: 'a parada de emergência ainda não foi confirmada pelo hardware',
  EMERGENCY_STOP_HARDWARE_UNCONFIRMED: 'a parada de emergência ainda não foi confirmada pelo hardware',
  EMERGENCY_LATCH_RESET_REQUIRED: 'o latch de emergência ainda precisa ser rearmado',
  HUMAN_PUMP_LEASE_ACTIVE: 'há controle humano ativo sobre uma bomba',
  HUMAN_VALVE_LEASE_ACTIVE: 'há controle humano ativo sobre uma válvula',
  MQTT_EXCLUSIVE_OPERATION_IN_PROGRESS: 'há uma operação MQTT exclusiva em andamento',
};

const OPERATIONAL_RECOVERY_GUIDANCE: Record<string, string> = {
  PROCESS_ACTIVE_OR_PAUSED: 'Conclua ou interrompa o processo responsável antes de alterar esta configuração.',
  PROCESS_STARTUP_IN_PROGRESS: 'Aguarde a partida terminar e consulte novamente o estado do processo.',
  GENERAL_CLOSURE_IN_PROGRESS: 'Aguarde o encerramento seguro terminar antes de repetir a operação.',
  TANK_LIFECYCLE_ACTIVE: 'Aguarde o ciclo de vida dos tanques terminar ou interrompa o processo com segurança.',
  TANK_CLOSURE_IN_PROGRESS: 'Aguarde o encerramento individual do tanque terminar.',
  EMERGENCY_STOP_UNCONFIRMED: 'Confirme a parada física do equipamento antes de prosseguir.',
  EMERGENCY_STOP_HARDWARE_UNCONFIRMED: 'Confirme a parada física do equipamento antes de prosseguir.',
  EMERGENCY_LATCH_RESET_REQUIRED: 'Rearme o latch de emergência conforme o procedimento seguro do equipamento.',
  HUMAN_PUMP_LEASE_ACTIVE: 'Libere o controle humano da bomba e tente novamente.',
  HUMAN_VALVE_LEASE_ACTIVE: 'Libere o controle humano da válvula e tente novamente.',
  MQTT_EXCLUSIVE_OPERATION_IN_PROGRESS: 'Aguarde a operação MQTT exclusiva terminar e atualize a tela.',
};

function getVersionDescription(data: ApiErrorPayload): string | null {
  const expected =
    data.expected_version ?? data.versao_esperada ?? data.expected_subsystem_version;
  const current = data.current_version ?? data.versao_atual ?? data.current_subsystem_version;

  if (expected === undefined && current === undefined) {
    return null;
  }

  return `Versão esperada: ${expected ?? 'não informada'}; versão atual: ${current ?? 'não informada'}.`;
}

function getOperationalDetails(data?: ApiErrorPayload): string[] {
  if (!data) {
    return [];
  }

  const details: string[] = [];

  if (data.code) {
    details.push(`Código: ${data.code}.`);
  }

  if (data.id_processo !== undefined) {
    const processState = data.status_processo ? ` (${data.status_processo})` : '';
    details.push(`Processo responsável: #${data.id_processo}${processState}.`);
  }

  const stage = data.etapa ?? data.estagio ?? data.status_partida ?? data.status_encerramento_geral;
  if (stage) {
    details.push(`Estágio operacional: ${stage}.`);
  }

  if (data.operacao) {
    details.push(`Operação bloqueada: ${data.operacao}.`);
  }

  if (data.bloqueios_operacionais?.length) {
    const blockerDescriptions = data.bloqueios_operacionais.map(
      (blocker) => OPERATIONAL_BLOCKER_LABELS[blocker] ?? blocker,
    );
    details.push(`Bloqueios: ${blockerDescriptions.join('; ')}.`);

    const guidance = Array.from(
      new Set(
        data.bloqueios_operacionais
          .map((blocker) => OPERATIONAL_RECOVERY_GUIDANCE[blocker])
          .filter((item): item is string => Boolean(item)),
      ),
    );
    if (guidance.length) {
      details.push(`Orientação: ${guidance.join(' ')}`);
    }
  }

  const versionDescription = getVersionDescription(data);
  if (versionDescription) {
    details.push(versionDescription);
  }

  return details;
}

function getResponseMessage(data?: ApiErrorPayload): string {
  const message = Array.isArray(data?.message)
    ? data.message[0] ?? DEFAULT_ERROR_MESSAGE
    : data?.message ?? DEFAULT_ERROR_MESSAGE;
  const operationalDetails = getOperationalDetails(data);

  return operationalDetails.length > 0
    ? `${message} ${operationalDetails.join(' ')}`
    : message;
}

function normalizeAxiosError(error: AxiosError<ApiErrorPayload>): ApiError {
  if (error.code === 'ECONNABORTED') {
    return new ApiError(
      'Tempo de conexao esgotado. Verifique se a API esta respondendo.',
      undefined,
      [],
      error,
    );
  }

  if (!error.response) {
    return new ApiError(
      'Nao foi possivel conectar a API. Verifique se o servidor esta rodando.',
      undefined,
      [],
      error,
    );
  }

  return new ApiError(
    getResponseMessage(error.response.data),
    error.response.status,
    error.response.data?.errors ?? [],
    error,
    error.response.data,
  );
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return normalizeAxiosError(error);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, undefined, [], error);
  }

  return new ApiError(DEFAULT_ERROR_MESSAGE, undefined, [], error);
}
