import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as processoService from '../services/processos.service';
import { joinProcessRoom, realtimeService } from '../services/realtime';
import type {
  ProcessAuxiliaryStateUpdatedPayload,
  ProcessDashboardUpdatedPayload,
  ProcessEmergencyStopPayload,
  ProcessGeneralClosureUpdatedPayload,
  ProcessStatusChangedPayload,
  ProcessTankClosureUpdatedPayload,
  ProcessTankUpdatedPayload,
  RealtimeListener,
} from '../services/realtime';
import type {
  ProcessoAuxiliarState,
  ProcessoDashboardResponse,
  ProcessoDashboardTank,
  ProcessoGeneralClosureState,
  ProcessoTankClosureState,
} from '../types';
import { useProcessOperationalState } from './useProcessOperationalState';

vi.mock('../services/processos.service', () => ({
  acquireAuxiliaryPumpControl: vi.fn(),
  acquireAuxiliaryValveControl: vi.fn(),
  closeAuxiliaryValve: vi.fn(),
  finalizeProcessoGeneralClosure: vi.fn(),
  getProcessoAuxiliaryState: vi.fn(),
  getProcessoDashboard: vi.fn(),
  getProcessoGeneralClosure: vi.fn(),
  openAuxiliaryValve: vi.fn(),
  releaseAuxiliaryPumpControl: vi.fn(),
  releaseAuxiliaryValveControl: vi.fn(),
  startProcessoTankClosure: vi.fn(),
  turnOffAuxiliaryPump: vi.fn(),
  turnOnAuxiliaryPump: vi.fn(),
}));

vi.mock('../services/realtime', () => ({
  joinProcessRoom: vi.fn(() => vi.fn()),
  realtimeService: {
    onProcessAuxiliaryStateUpdated: vi.fn(() => vi.fn()),
    onProcessDashboardUpdated: vi.fn(() => vi.fn()),
    onProcessEmergencyStop: vi.fn(() => vi.fn()),
    onProcessGeneralClosureUpdated: vi.fn(() => vi.fn()),
    onProcessStatusChanged: vi.fn(() => vi.fn()),
    onProcessTankClosureUpdated: vi.fn(() => vi.fn()),
    onProcessTankUpdated: vi.fn(() => vi.fn()),
  },
}));

function generalClosure(overrides: Partial<ProcessoGeneralClosureState> = {}): ProcessoGeneralClosureState {
  return {
    status: 'PENDENTE',
    etapa: 'AGUARDANDO_TANQUES',
    automatico: false,
    pronto_para_iniciar: false,
    aguardando_acao_manual: true,
    hardware_confirmado: false,
    iniciado_em: null,
    finalizado_em: null,
    confirmacao_iniciada_em: null,
    proxima_tentativa_em: null,
    tentativa: 0,
    comando_tentativas: 0,
    ultimo_erro: null,
    versao: 5,
    ...overrides,
  };
}

function tankClosure(overrides: Partial<ProcessoTankClosureState> = {}): ProcessoTankClosureState {
  return {
    status: 'PENDENTE',
    etapa: 'AGUARDANDO_ESTABILIZACAO',
    automatico: false,
    pronto_para_encerrar: false,
    aguardando_acao_manual: false,
    pode_desacoplar: false,
    mangueira_acoplada: true,
    iniciado_em: null,
    isolado_em: null,
    retencao_iniciada_em: null,
    retencao_finalizada_em: null,
    vacuo_isolamento: null,
    perda_vacuo_retencao: null,
    motivo_bloqueio: null,
    versao: 7,
    tentativa: 0,
    comando_tentativas: 0,
    proxima_tentativa_em: null,
    estabilizacao: {
      tempo_necessario_segundos: 30,
      cobertura_minima_percentual: 80,
      leituras_esperadas: 10,
      leituras_observadas: 3,
      cobertura_atual_percentual: 30,
      maior_intervalo_ms: 1000,
      timeout_leitura_ms: 5000,
      continuidade_aprovada: false,
    },
    retencao: { tempo_necessario_segundos: 60, perda_maxima_permitida: 3 },
    seguranca: { limite_vacuo: -95, limite_excedido: false },
    ...overrides,
  };
}

function dashboardTank(overrides: Partial<ProcessoDashboardTank> = {}): ProcessoDashboardTank {
  return {
    id_processo_tanque: 21,
    id_tanque: 1,
    nome_tanque: 'Tanque 1',
    status_tanque_processo: 'GERANDO_VACUO',
    vacuo_atingido: false,
    vacuo_estabilizado: false,
    vacuo_alvo: -80,
    vacuo_atual: -45,
    vacuo_inicial: -5,
    vacuo_final: null,
    vacuo_medio: -30,
    eficiencia: 55,
    iniciado_em: '2026-07-21T12:00:00.000Z',
    finalizado_em: null,
    ultima_leitura_em: '2026-07-21T12:01:00.000Z',
    ultima_leitura_recebida_em: '2026-07-21T12:01:00.100Z',
    total_sensores: 1,
    total_leituras: 1,
    encerramento: tankClosure(),
    estagnacao: {
      status: 'NORMAL',
      suspeita: false,
      detectada: false,
      iniciada_em: null,
      detectada_em: null,
      ultima_avaliacao_em: '2026-07-21T12:01:00.000Z',
      duracao_segundos: 0,
      variacao_vacuo: -5,
      janela_segundos: 30,
      variacao_minima_esperada: 1,
      variacao_minima_base: 1,
      leituras_janela: 3,
      leituras_minimas: 3,
      janelas_sem_progresso: 0,
      janelas_consecutivas_necessarias: 3,
      id_alarme_ativo: null,
      mensagem: 'Progresso normal.',
      evidencias: {
        fator_volume: 1,
        fator_tanques_ativos: 1,
        fator_proximidade_alvo: 1,
        volume_tanque: 100,
        volume_medio_tanques_ativos: 100,
        tanques_ativos: 1,
        vacuo_atual: -45,
        distancia_alvo: 35,
        tempo_bomba_principal_segundos: 60,
        motivo_decisao: 'Variacao suficiente.',
      },
    },
    leituras: [{
      id_leitura_sensor: 100,
      id_processo_tanque_sensor: 31,
      id_tanque: 1,
      id_sensor: 14,
      valor_vacuo: -45,
      leitura_em: '2026-07-21T12:01:00.000Z',
      recebido_em: '2026-07-21T12:01:00.100Z',
    }],
    ...overrides,
  };
}

function auxiliaryState(): ProcessoAuxiliarState {
  return {
    id_processo: 9,
    modo_operacao_auxiliar: 'ASSISTIDO',
    status_subsistema: 'AGUARDANDO',
    versao: 4,
    tanque_em_atendimento: null,
    bomba_auxiliar: null,
    tanques: [{
      id_processo_tanque_auxiliar: 41,
      id_processo_tanque: 21,
      id_tanque: 1,
      nome_tanque: 'Tanque 1',
      status_auxilio: 'AGUARDANDO',
      prioridade: 1,
      posicao_fila: 1,
      solicitado_em: null,
      iniciado_em: null,
      finalizado_em: null,
      versao: 8,
      motivo_bloqueio: null,
      ultimo_erro: null,
      evidencias: {
        avaliacao_iniciada_em: null,
        avaliacao_finalizada_em: null,
        vacuo_antes: null,
        tendencia_antes: null,
        vacuo_durante: null,
        tendencia_durante: null,
        vacuo_apos: null,
        tendencia_apos: null,
        melhoria_observada: null,
        melhoria_minima_esperada: null,
        eficacia_confirmada: null,
        motivo: null,
      },
      status_acoplamento: 'ACOPLADO',
      quantidade_valvulas_auxiliares: 1,
      valvula_auxiliar: null,
    }],
    motivo_bloqueio: null,
    ultimo_erro: null,
    atualizado_em: '2026-07-21T12:01:00.000Z',
    snapshot_at: '2026-07-21T12:01:00.000Z',
  };
}

function dashboard(): ProcessoDashboardResponse {
  const auxiliary = auxiliaryState();
  return {
    id_processo: 9,
    snapshot_at: '2026-07-21T12:01:00.000Z',
    nome_processo: 'Lote 2026-014',
    status_processo: 'EM_EXECUCAO',
    vacuo_alvo: -80,
    vacuo_atual: -45,
    tempo_maximo: 900,
    tempo_execucao: 60,
    iniciado_em: '2026-07-21T12:00:00.000Z',
    finalizado_em: null,
    progresso_percentual: 55,
    parada_emergencia: {
      ativa: false,
      status: 'INATIVA',
      etapa: 'NAO_SOLICITADA',
      hardware_confirmado: false,
      nivel_confirmacao: 'NAO_APLICAVEL',
      latch_emergencia_confirmado: false,
      saidas_controlador_confirmadas: false,
      feedback_mecanico_disponivel: false,
      requer_intervencao: false,
      solicitada_em: null,
      confirmada_em: null,
      proxima_tentativa_em: null,
      tentativa: 0,
      comando_tentativas: 0,
      ultimo_erro: null,
      versao: 1,
    },
    encerramento: {
      habilitado: true,
      fase_processo: 'EXECUCAO',
      pode_desacoplar: false,
      geral: generalClosure(),
      total_tanques: 1,
      tanques_concluidos: 0,
      tanques_prontos: 0,
      tanques_aguardando_acao_manual: 0,
      tanques_pendentes: 1,
      versao: 5,
      parametros: {
        tolerancia_vacuo_percentual: 2,
        limite_seguranca_vacuo: -95,
        tempo_estabilizacao_segundos: 30,
        cobertura_minima_percentual: 80,
        intervalo_leitura_esperado_ms: 1000,
        timeout_leitura_sensor_ms: 5000,
        tempo_retencao_segundos: 60,
        perda_vacuo_maxima_retencao: 3,
      },
    },
    subsistema_auxiliar: auxiliary,
    tanques: [dashboardTank()],
    alarmes: { total: 0, criticos: 0, medios: 0, infos: 0, ultima_severidade: null },
  };
}

let tankListener: RealtimeListener<ProcessTankUpdatedPayload>;
let tankClosureListener: RealtimeListener<ProcessTankClosureUpdatedPayload>;
let closureListener: RealtimeListener<ProcessGeneralClosureUpdatedPayload>;
let statusListener: RealtimeListener<ProcessStatusChangedPayload>;
let emergencyListener: RealtimeListener<ProcessEmergencyStopPayload>;
let dashboardListener: RealtimeListener<ProcessDashboardUpdatedPayload>;
let auxiliaryListener: RealtimeListener<ProcessAuxiliaryStateUpdatedPayload>;

describe('useProcessOperationalState', () => {
  beforeEach(() => {
    const initialDashboard = dashboard();
    vi.mocked(processoService.getProcessoDashboard).mockResolvedValue(initialDashboard);
    vi.mocked(processoService.getProcessoGeneralClosure).mockResolvedValue(initialDashboard.encerramento.geral);
    vi.mocked(processoService.getProcessoAuxiliaryState).mockResolvedValue(initialDashboard.subsistema_auxiliar);
    vi.mocked(processoService.startProcessoTankClosure).mockResolvedValue({ message: 'Encerramento do tanque iniciado.' } as never);
    vi.mocked(processoService.finalizeProcessoGeneralClosure).mockResolvedValue({ message: 'Encerramento geral solicitado.' } as never);
    vi.mocked(processoService.acquireAuxiliaryPumpControl).mockResolvedValue({ message: 'Controle da bomba assumido.' } as never);
    vi.mocked(processoService.releaseAuxiliaryPumpControl).mockResolvedValue({ message: 'Controle da bomba liberado.' } as never);
    vi.mocked(processoService.acquireAuxiliaryValveControl).mockResolvedValue({ message: 'Controle da valvula assumido.' } as never);
    vi.mocked(processoService.releaseAuxiliaryValveControl).mockResolvedValue({ message: 'Controle da valvula liberado.' } as never);
    vi.mocked(processoService.turnOnAuxiliaryPump).mockResolvedValue({ message: 'Bomba ligada.' } as never);
    vi.mocked(processoService.turnOffAuxiliaryPump).mockResolvedValue({ message: 'Bomba desligada.' } as never);
    vi.mocked(processoService.openAuxiliaryValve).mockResolvedValue({ message: 'Valvula aberta.' } as never);
    vi.mocked(processoService.closeAuxiliaryValve).mockResolvedValue({ message: 'Valvula fechada.' } as never);

    vi.mocked(realtimeService.onProcessTankUpdated).mockImplementation((listener) => {
      tankListener = listener;
      return vi.fn();
    });
    vi.mocked(realtimeService.onProcessTankClosureUpdated).mockImplementation((listener) => {
      tankClosureListener = listener;
      return vi.fn();
    });
    vi.mocked(realtimeService.onProcessGeneralClosureUpdated).mockImplementation((listener) => {
      closureListener = listener;
      return vi.fn();
    });
    vi.mocked(realtimeService.onProcessStatusChanged).mockImplementation((listener) => {
      statusListener = listener;
      return vi.fn();
    });
    vi.mocked(realtimeService.onProcessEmergencyStop).mockImplementation((listener) => {
      emergencyListener = listener;
      return vi.fn();
    });
    vi.mocked(realtimeService.onProcessDashboardUpdated).mockImplementation((listener) => {
      dashboardListener = listener;
      return vi.fn();
    });
    vi.mocked(realtimeService.onProcessAuxiliaryStateUpdated).mockImplementation((listener) => {
      auxiliaryListener = listener;
      return vi.fn();
    });
  });

  it('carrega snapshots, entra na sala e aplica eventos de tanque, encerramento, status e emergencia', async () => {
    const { result } = renderHook(() => useProcessOperationalState(9, true));
    await waitFor(() => expect(result.current.dashboard?.id_processo).toBe(9));
    expect(joinProcessRoom).toHaveBeenCalledWith(9);

    const updatedTank = dashboardTank({
      status_tanque_processo: 'VACUO_ATINGIDO',
      vacuo_atual: -80,
      total_leituras: 2,
      leituras: [],
    });
    const { leituras: _ignoredReadings, ...tankSnapshot } = updatedTank;
    expect(_ignoredReadings).toEqual([]);
    const newReading = {
      id_leitura_sensor: 101,
      id_processo_tanque_sensor: 31,
      id_tanque: 1,
      id_sensor: 14,
      valor_vacuo: -80,
      leitura_em: '2026-07-21T12:02:00.000Z',
      recebido_em: '2026-07-21T12:02:00.100Z',
    };

    act(() => tankListener({
      id_processo: 9,
      id_processo_tanque: 21,
      id_tanque: 1,
      lifecycle_changed: true,
      previous_status: 'GERANDO_VACUO',
      closure_changed: false,
      previous_closure_status: 'PENDENTE',
      stagnation_changed: false,
      previous_stagnation_status: 'NORMAL',
      tank: tankSnapshot,
      reading: newReading,
      emitted_at: '2026-07-21T12:02:00.100Z',
    }));
    expect(result.current.dashboard?.tanques[0].status_tanque_processo).toBe('VACUO_ATINGIDO');
    expect(result.current.dashboard?.tanques[0].leituras).toHaveLength(2);

    const completedClosure = generalClosure({ status: 'CONCLUIDO', versao: 6 });
    act(() => closureListener({
      id_processo: 9,
      previous_status: 'PENDENTE',
      closure: completedClosure,
      message: 'Encerramento confirmado.',
      emitted_at: '2026-07-21T12:03:00.000Z',
    }));
    expect(result.current.generalClosure).toEqual(completedClosure);

    act(() => statusListener({
      id_processo: 9,
      status_processo: 'PAUSADO',
      previous_status: 'EM_EXECUCAO',
      emitted_at: '2026-07-21T12:03:01.000Z',
    }));
    expect(result.current.dashboard?.status_processo).toBe('PAUSADO');

    act(() => emergencyListener({
      id_processo: 9,
      message: 'Parada recebida; aguardando confirmacao do hardware.',
      parada_emergencia: {
        ...dashboard().parada_emergencia,
        ativa: true,
        status: 'PENDENTE_CONFIRMACAO',
        requer_intervencao: true,
        versao: 2,
      },
      emitted_at: '2026-07-21T12:03:02.000Z',
    }));
    expect(result.current.dashboard?.parada_emergencia.hardware_confirmado).toBe(false);
    expect(result.current.feedback).toContain('aguardando confirmacao');

    act(() => tankClosureListener({
      id_processo: 9,
      id_processo_tanque: 21,
      id_tanque: 1,
      previous_status: 'PENDENTE',
      closure: tankClosure({ status: 'RETENCAO', versao: 8 }),
      message: 'Tanque em retencao.',
      emitted_at: '2026-07-21T12:03:03.000Z',
    }));
    expect(result.current.dashboard?.tanques[0].encerramento.status).toBe('RETENCAO');

    const newerAuxiliary = { ...auxiliaryState(), versao: 6, status_subsistema: 'ATUANDO' };
    act(() => auxiliaryListener({
      id_processo: 9,
      auxiliary_state: newerAuxiliary,
      emitted_at: '2026-07-21T12:03:04.000Z',
    }));
    expect(result.current.auxiliaryState?.versao).toBe(6);

    const refreshedDashboard = { ...dashboard(), progresso_percentual: 90 };
    act(() => dashboardListener({
      id_processo: 9,
      dashboard: refreshedDashboard,
      emitted_at: '2026-07-21T12:03:05.000Z',
    }));
    expect(result.current.dashboard?.progresso_percentual).toBe(90);
  });

  it('envia versoes otimistas corretas no encerramento individual e geral', async () => {
    const { result } = renderHook(() => useProcessOperationalState(9, true));
    await waitFor(() => expect(result.current.dashboard).not.toBeNull());

    await act(async () => result.current.startTankClosure(21, 'Vacuo estabilizado'));
    expect(processoService.startProcessoTankClosure).toHaveBeenCalledWith(9, 21, {
      expected_version: 7,
      motivo: 'Vacuo estabilizado',
    });

    await act(async () => result.current.finalizeGeneralClosure('Tanques isolados'));
    expect(processoService.finalizeProcessoGeneralClosure).toHaveBeenCalledWith(9, {
      expected_version: 5,
      motivo: 'Tanques isolados',
    });
  });

  it('preserva versoes, lease, motivo normalizado e correlation id em todas as atuacoes auxiliares', async () => {
    const { result } = renderHook(() => useProcessOperationalState(9, true));
    await waitFor(() => expect(result.current.auxiliaryState).not.toBeNull());

    await act(async () => result.current.acquirePump('Ajuste tecnico', 120));
    expect(processoService.acquireAuxiliaryPumpControl).toHaveBeenCalledWith(9, {
      expected_version: 4,
      duration_seconds: 120,
      motivo: 'Ajuste tecnico',
    });
    await act(async () => result.current.releasePump('ok'));
    expect(processoService.releaseAuxiliaryPumpControl).toHaveBeenCalledWith(9, {
      expected_version: 4,
      motivo: 'Intervencao tecnica supervisionada pelo painel.',
    });
    await act(async () => result.current.acquireValve(21, 'Controle manual', 90));
    expect(processoService.acquireAuxiliaryValveControl).toHaveBeenCalledWith(9, 21, {
      expected_version: 8,
      duration_seconds: 90,
      motivo: 'Controle manual',
    });
    await act(async () => result.current.releaseValve(21, 'Fim do ajuste'));
    expect(processoService.releaseAuxiliaryValveControl).toHaveBeenCalledWith(9, 21, {
      expected_version: 8,
      motivo: 'Fim do ajuste',
    });

    await act(async () => result.current.turnOnPump(21, 'Atender tanque'));
    expect(processoService.turnOnAuxiliaryPump).toHaveBeenCalledWith(9, 21, expect.objectContaining({
      expected_subsystem_version: 4,
      expected_tank_version: 8,
      correlation_id: expect.stringMatching(/^front-ligar-bomba-/),
    }));
    await act(async () => result.current.turnOffPump('Finalizar apoio'));
    expect(processoService.turnOffAuxiliaryPump).toHaveBeenCalledWith(9, expect.objectContaining({
      expected_subsystem_version: 4,
      correlation_id: expect.stringMatching(/^front-desligar-bomba-/),
    }));
    await act(async () => result.current.openValve(21, 'Direcionar vacuo'));
    expect(processoService.openAuxiliaryValve).toHaveBeenCalledWith(9, 21, expect.objectContaining({
      expected_subsystem_version: 4,
      expected_tank_version: 8,
      correlation_id: expect.stringMatching(/^front-abrir-valvula-/),
    }));
    await act(async () => result.current.closeValve(21, 'Isolar tanque'));
    expect(processoService.closeAuxiliaryValve).toHaveBeenCalledWith(9, 21, expect.objectContaining({
      expected_subsystem_version: 4,
      expected_tank_version: 8,
      correlation_id: expect.stringMatching(/^front-fechar-valvula-/),
    }));
    expect(result.current.feedback).toBe('Valvula fechada.');
  });

  it('impede atuacao sem snapshot e apresenta falha estruturada da API', async () => {
    const { result: disabledResult } = renderHook(() => useProcessOperationalState(null, false));
    await act(async () => new Promise((resolve) => window.setTimeout(resolve, 0)));
    await act(async () => disabledResult.current.acquirePump('Teste', 60));
    expect(disabledResult.current.error).toContain('ainda nao esta disponivel');

    vi.mocked(processoService.turnOffAuxiliaryPump).mockRejectedValue({
      message: 'Lease humano pertence a outro usuario.',
    });
    const { result } = renderHook(() => useProcessOperationalState(9, true));
    await waitFor(() => expect(result.current.auxiliaryState).not.toBeNull());
    await act(async () => result.current.turnOffPump('Interromper'));
    expect(result.current.error).toBe('Lease humano pertence a outro usuario.');
    expect(result.current.actionLoading).toBeNull();
    act(() => result.current.clearFeedback());
    expect(result.current.error).toBeNull();
  });
});
