import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as processoService from '../services/processos.service';
import type { ProcessoFormState, ProcessoPrecheckResponse } from '../types';
import { useProcessActions } from './useProcessActions';

vi.mock('../services/processos.service', () => ({
  createProcesso: vi.fn(),
  startProcesso: vi.fn(),
  pauseProcesso: vi.fn(),
  resumeProcesso: vi.fn(),
  finishProcesso: vi.fn(),
  interruptProcesso: vi.fn(),
  emergencyStopProcesso: vi.fn(),
}));

const actionResponse = {
  success: true,
  message: 'Comando aceito; confirmação de hardware pendente.',
  id_processo: 9,
  status_processo: 'EM_EXECUCAO',
};

const configuredForm: ProcessoFormState = {
  nome_processo: ' Processo crítico ',
  tempo_maximo: '900',
  quantidade_tanques: '2',
  modo_operacao_auxiliar: 'ASSISTIDO',
  encerramento_automatico: false,
  tanques: [
    {
      id_tanque: '1',
      prioridade: '2',
      vacuo_alvo_tanque: '-80',
      id_sensor: '11',
      observacoes_sensor: ' Sensor primário ',
    },
    {
      id_tanque: '2',
      prioridade: '1',
      vacuo_alvo_tanque: '-75.5',
      id_sensor: '12',
      observacoes_sensor: '',
    },
  ],
};

describe('useProcessActions', () => {
  beforeEach(() => {
    vi.mocked(processoService.createProcesso).mockResolvedValue(actionResponse as never);
    vi.mocked(processoService.startProcesso).mockResolvedValue(actionResponse as never);
    vi.mocked(processoService.pauseProcesso).mockResolvedValue(actionResponse as never);
    vi.mocked(processoService.resumeProcesso).mockResolvedValue(actionResponse as never);
    vi.mocked(processoService.finishProcesso).mockResolvedValue(actionResponse as never);
    vi.mocked(processoService.interruptProcesso).mockResolvedValue(actionResponse as never);
    vi.mocked(processoService.emergencyStopProcesso).mockResolvedValue(actionResponse as never);
  });

  it('monta o payload obrigatório com modo, encerramento, prioridades e vácuo negativo em kPa', async () => {
    const onDone = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useProcessActions(onDone));

    await act(async () => result.current.createConfiguredProcess(configuredForm));

    expect(processoService.createProcesso).toHaveBeenCalledWith({
      nome_processo: 'Processo crítico',
      tempo_maximo: 900,
      modo_operacao_auxiliar: 'ASSISTIDO',
      encerramento_automatico: false,
      tanques: [
        {
          id_tanque: 1,
          prioridade: 2,
          vacuo_alvo: -80,
          sensores: [{ id_sensor: 11, observacoes: 'Sensor primário' }],
        },
        {
          id_tanque: 2,
          prioridade: 1,
          vacuo_alvo: -75.5,
          sensores: [{ id_sensor: 12, observacoes: undefined }],
        },
      ],
    });
    expect(result.current.actionSuccess).toBe(actionResponse.message);
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('remove prioridade automática no modo manual', async () => {
    const { result } = renderHook(() => useProcessActions(vi.fn().mockResolvedValue(undefined)));

    await act(async () => result.current.createConfiguredProcess({
      ...configuredForm,
      modo_operacao_auxiliar: 'MANUAL',
    }));

    expect(processoService.createProcesso).toHaveBeenCalledWith(
      expect.objectContaining({
        tanques: expect.arrayContaining([
          expect.objectContaining({ id_tanque: 1, prioridade: undefined }),
          expect.objectContaining({ id_tanque: 2, prioridade: undefined }),
        ]),
      }),
    );
  });

  it.each([
    ['pause', 'pauseProcesso'],
    ['resume', 'resumeProcesso'],
    ['finish', 'finishProcesso'],
    ['interrupt', 'interruptProcesso'],
    ['emergency-stop', 'emergencyStopProcesso'],
  ] as const)('usa a mensagem real do envelope em %s', async (action, method) => {
    const { result } = renderHook(() => useProcessActions(vi.fn().mockResolvedValue(undefined)));

    await act(async () => result.current.runProcessAction(action, 9, 'Motivo supervisionado'));

    expect(processoService[method]).toHaveBeenCalled();
    expect(result.current.actionSuccess).toBe(actionResponse.message);
  });

  it('abre a pré-checagem retornada pela API quando a partida é bloqueada', async () => {
    const precheck: ProcessoPrecheckResponse = {
      id_processo: 9,
      status_geral: 'REPROVADO',
      aprovado: false,
      bloqueado: true,
      itens: [],
    };
    vi.mocked(processoService.startProcesso).mockRejectedValue({
      message: 'Partida bloqueada',
      originalError: { response: { data: { prechecagem: precheck } } },
    });
    const onPrecheckBlocked = vi.fn();
    const { result } = renderHook(() => useProcessActions(
      vi.fn().mockResolvedValue(undefined),
      { onPrecheckBlocked },
    ));

    await act(async () => result.current.runProcessAction('start', 9));

    expect(onPrecheckBlocked).toHaveBeenCalledWith(precheck);
    expect(result.current.actionError).toContain('Revise a pre-checagem');
    expect(result.current.actionSuccess).toBeNull();
  });
});
