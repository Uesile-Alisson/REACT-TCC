import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError, normalizeApiError } from './api-error';

function createAxiosError(
  status: number,
  data: Record<string, unknown>,
): AxiosError {
  const response: AxiosResponse = {
    data,
    status,
    statusText: 'Request failed',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };

  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', response.config, undefined, response);
}

describe('normalizeApiError', () => {
  it('preserva intertravamentos, processo, estágio, versões e orientação de recuperação', () => {
    const error = normalizeApiError(createAxiosError(409, {
      message: 'Alteração bloqueada.',
      code: 'OPERATION_INTERLOCKED',
      bloqueios_operacionais: ['PROCESS_ACTIVE_OR_PAUSED', 'HUMAN_PUMP_LEASE_ACTIVE'],
      id_processo: 42,
      status_processo: 'PAUSADO',
      etapa: 'ENCERRAMENTO',
      expected_version: 7,
      current_version: 9,
    }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('OPERATION_INTERLOCKED');
    expect(error.operationalBlockers).toEqual([
      'PROCESS_ACTIVE_OR_PAUSED',
      'HUMAN_PUMP_LEASE_ACTIVE',
    ]);
    expect(error.message).toContain('Processo responsável: #42 (PAUSADO).');
    expect(error.message).toContain('Estágio operacional: ENCERRAMENTO.');
    expect(error.message).toContain('Versão esperada: 7; versão atual: 9.');
    expect(error.message).toContain('Libere o controle humano da bomba');
  });

  it('diferencia timeout de indisponibilidade da API', () => {
    const timeout = new AxiosError('timeout', 'ECONNABORTED');
    const offline = new AxiosError('network', 'ERR_NETWORK');

    expect(normalizeApiError(timeout).message).toContain('Tempo de conexao esgotado');
    expect(normalizeApiError(offline).message).toContain('Nao foi possivel conectar a API');
  });

  it('não altera ApiError já normalizado e trata valores desconhecidos', () => {
    const existing = new ApiError('Falha conhecida', 422);

    expect(normalizeApiError(existing)).toBe(existing);
    expect(normalizeApiError('falha')).toMatchObject({
      message: 'Nao foi possivel concluir a solicitacao.',
    });
    expect(normalizeApiError(new Error('Falha local')).message).toBe('Falha local');
  });

  it('preserva erros de validação e códigos de bloqueio ainda desconhecidos pelo front', () => {
    const error = normalizeApiError(createAxiosError(400, {
      message: ['Campo obrigatório ausente', 'Segundo erro'],
      code: 'VALIDATION_FAILED',
      operacao: 'PATCH_CONFIG',
      bloqueios_operacionais: ['NOVO_INTERTRAVAMENTO'],
      errors: [{ field: 'tempo_maximo', messages: ['Obrigatório'] }],
    }));

    expect(error.message).toContain('Campo obrigatório ausente');
    expect(error.message).toContain('Operação bloqueada: PATCH_CONFIG.');
    expect(error.message).toContain('NOVO_INTERTRAVAMENTO');
    expect(error.validationErrors).toHaveLength(1);
  });
});
