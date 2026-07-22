import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as processoService from '../services/processos.service';
import type { ProcessoPrecheckItem, ProcessoPrecheckResponse } from '../types';
import { useProcessPrecheck } from './useProcessPrecheck';

vi.mock('../services/processos.service', () => ({
  abrirValvulaProcesso: vi.fn(),
  executarPrechecagem: vi.fn(),
  fecharValvulaProcesso: vi.fn(),
  getPrechecagem: vi.fn(),
  listarValvulasProcesso: vi.fn(),
  validarAcoplamentoTanque: vi.fn(),
  validarValvulaProcesso: vi.fn(),
}));

vi.mock('./useRealtime', () => ({
  useRealtime: () => ({ lastPrecheckResult: null }),
}));

const approvedPrecheck: ProcessoPrecheckResponse = {
  id_processo: 9,
  status_geral: 'APROVADO',
  aprovado: true,
  bloqueado: false,
  itens: [],
  grupos: [],
  falhas_bloqueantes: [],
  avisos: [],
  recomendacoes: [],
};

function correctiveItem(
  code: NonNullable<ProcessoPrecheckItem['acao_corretiva']>['codigo'],
  endpoint: string,
): ProcessoPrecheckItem {
  return {
    titulo: 'Pendência técnica',
    grupo: code === 'TESTAR_ESTADO_SEGURO_VALVULA' ? 'VALVULAS' : 'SENSORES',
    status: 'REPROVADO',
    bloqueante: true,
    id_recurso: 3,
    acao_corretiva: {
      codigo: code,
      titulo: 'Executar correção',
      metodo: code === 'TESTAR_ESTADO_SEGURO_VALVULA' ? 'POST' : 'GET',
      endpoint,
      disponivel: true,
      requer_confirmacao: code === 'TESTAR_ESTADO_SEGURO_VALVULA',
      reexecutar_prechecagem: true,
      motivo_indisponibilidade: null,
    },
  };
}

describe('useProcessPrecheck', () => {
  beforeEach(() => {
    vi.mocked(processoService.getPrechecagem).mockResolvedValue(approvedPrecheck);
    vi.mocked(processoService.executarPrechecagem).mockResolvedValue(approvedPrecheck);
    vi.mocked(processoService.listarValvulasProcesso).mockResolvedValue([]);
    vi.mocked(processoService.validarAcoplamentoTanque).mockResolvedValue(approvedPrecheck);
    vi.mocked(processoService.abrirValvulaProcesso).mockResolvedValue({ message: 'Abertura aceita' } as never);
    vi.mocked(processoService.fecharValvulaProcesso).mockResolvedValue({ message: 'Fechamento aceito' } as never);
    vi.mocked(processoService.validarValvulaProcesso).mockResolvedValue({
      id_processo: 9,
      id_valvula: 3,
      acao: 'VALIDAR',
      status: 'NAO_CONFIRMADO',
      aprovado: false,
      mensagem: 'Snapshot novo não recebido.',
      evidencia: null,
      detalhes: { snapshot_recebido: false, estado_controlador_confirmado: false },
      executado_em: '2026-07-21T20:00:00.000Z',
    });
  });

  it('executa somente o endpoint de teste seguro esperado e reexecuta a pré-checagem', async () => {
    const { result } = renderHook(() => useProcessPrecheck(9));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const item = correctiveItem(
      'TESTAR_ESTADO_SEGURO_VALVULA',
      '/processos/9/valvulas/3/validar',
    );

    await act(async () => result.current.runCorrectiveAction(item));

    expect(processoService.validarValvulaProcesso).toHaveBeenCalledWith(9, 3);
    expect(processoService.executarPrechecagem).toHaveBeenCalledWith(9);
    expect(result.current.valveTestResults[3]?.status).toBe('NAO_CONFIRMADO');
  });

  it('bloqueia por segurança um endpoint corretivo adulterado', async () => {
    const { result } = renderHook(() => useProcessPrecheck(9));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.runCorrectiveAction(correctiveItem(
      'TESTAR_ESTADO_SEGURO_VALVULA',
      '/mqtt-hardware/commands/abrir-todas-valvulas',
    )));

    expect(processoService.validarValvulaProcesso).not.toHaveBeenCalled();
    expect(result.current.error).toContain('bloqueada por seguranca');
  });

  it('abre o fluxo técnico do sensor sem executar endpoint arbitrário', async () => {
    const { result } = renderHook(() => useProcessPrecheck(9));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.runCorrectiveAction(correctiveItem(
      'DIAGNOSTICAR_SENSOR',
      '/configuracoes/sensores/3',
    )));

    expect(result.current.sensorCorrectiveContext).toMatchObject({
      idSensor: 3,
      action: { codigo: 'DIAGNOSTICAR_SENSOR' },
    });
    expect(processoService.executarPrechecagem).toHaveBeenCalledWith(9);
  });

  it('executa atualização, acoplamento e comandos de válvula com nova consulta do estado', async () => {
    const { result } = renderHook(() => useProcessPrecheck(9));
    await waitFor(() => expect(result.current.precheck).not.toBeNull());

    await act(async () => result.current.refreshPrecheck());
    expect(result.current.feedback).toContain('atualizado');
    await act(async () => result.current.validateTankCoupling(2));
    expect(processoService.validarAcoplamentoTanque).toHaveBeenCalledWith(9, 2);
    await act(async () => result.current.openValve(3));
    expect(processoService.abrirValvulaProcesso).toHaveBeenCalledWith(9, 3);
    await act(async () => result.current.closeValve(3));
    expect(processoService.fecharValvulaProcesso).toHaveBeenCalledWith(9, 3);
  });

  it('não executa ação indisponível ou orientação sem executor automático', async () => {
    const { result } = renderHook(() => useProcessPrecheck(9));
    await waitFor(() => expect(result.current.precheck).not.toBeNull());
    const unavailable = correctiveItem('DIAGNOSTICAR_SENSOR', '/configuracoes/sensores/3');
    unavailable.acao_corretiva = {
      ...unavailable.acao_corretiva!,
      disponivel: false,
      motivo_indisponibilidade: 'Sensor sem telemetria recente.',
    };

    await act(async () => result.current.runCorrectiveAction(unavailable));
    expect(result.current.error).toBe('Sensor sem telemetria recente.');

    const manualReview = correctiveItem('TESTAR_ESTADO_SEGURO_VALVULA', '/processos/9/valvulas/3/validar');
    manualReview.acao_corretiva = {
      codigo: 'REVISAR_CONFIGURACAO_VALVULA',
      titulo: 'Revisar configuração',
      metodo: null,
      endpoint: null,
      disponivel: true,
      requer_confirmacao: false,
      reexecutar_prechecagem: false,
      motivo_indisponibilidade: null,
    };
    await act(async () => result.current.runCorrectiveAction(manualReview));
    expect(result.current.error).toContain('sem executor seguro');
  });

  it('deriva tanques e sensores dos itens retornados pelo contrato', async () => {
    vi.mocked(processoService.getPrechecagem).mockResolvedValue({
      ...approvedPrecheck,
      itens: [
        {
          titulo: 'Acoplamento T2',
          grupo: 'ACOPLAMENTO',
          status: 'PENDENTE',
          detalhes: { id_tanque: 2 },
        },
        {
          titulo: 'Sensor S14',
          grupo: 'SENSORES',
          status: 'REPROVADO',
          id_recurso: 14,
        },
      ],
    });
    const { result } = renderHook(() => useProcessPrecheck(9));

    await waitFor(() => expect(result.current.tanks).toHaveLength(1));
    expect(result.current.tanks[0]).toMatchObject({ id: 2, label: 'Acoplamento T2' });
    expect(result.current.sensors[0]).toMatchObject({ id: 14, label: 'Sensor S14' });
  });
});
