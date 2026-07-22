import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../api/axios';
import * as service from './processos.service';

vi.mock('../api/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const responseData = { success: true, message: 'Operação aceita.' };

describe('processos.service — contratos HTTP', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ data: responseData });
    vi.mocked(api.post).mockResolvedValue({ data: responseData });
    vi.mocked(api.patch).mockResolvedValue({ data: responseData });
  });

  it('envia criação e ações de ciclo de vida para as rotas corretas', async () => {
    const createPayload = {
      tempo_maximo: 900,
      modo_operacao_auxiliar: 'AUTOMATICO' as const,
      encerramento_automatico: true,
      tanques: [{ id_tanque: 1, prioridade: 1, vacuo_alvo: -80, sensores: [{ id_sensor: 4 }] }],
    };
    await expect(service.createProcesso(createPayload)).resolves.toBe(responseData);
    expect(api.post).toHaveBeenLastCalledWith('/processos', createPayload);

    await service.startProcesso(10);
    expect(api.post).toHaveBeenLastCalledWith('/processos/10/iniciar');
    await service.pauseProcesso(10);
    expect(api.post).toHaveBeenLastCalledWith('/processos/10/pausar');
    await service.resumeProcesso(10);
    expect(api.post).toHaveBeenLastCalledWith('/processos/10/retomar');

    await service.finishProcesso(10, { observacao: 'Encerramento supervisionado' });
    expect(api.post).toHaveBeenLastCalledWith('/processos/10/finalizar', {
      observacao: 'Encerramento supervisionado',
    });
    await service.interruptProcesso(10, { motivo: 'Falha técnica confirmada' });
    expect(api.post).toHaveBeenLastCalledWith('/processos/10/interromper', {
      motivo: 'Falha técnica confirmada',
    });
    await service.emergencyStopProcesso(10, { motivo: 'Risco imediato' });
    expect(api.post).toHaveBeenLastCalledWith('/processos/10/parada-emergencia', {
      motivo: 'Risco imediato',
    });

    await service.updateProcessoConfig(10, { encerramento_automatico: false });
    expect(api.patch).toHaveBeenLastCalledWith('/processos/10/config', {
      encerramento_automatico: false,
    });
  });

  it('consulta lista, snapshots operacionais, leituras e eventos', async () => {
    await service.listProcessos({ page: 2, limit: 20 });
    expect(api.get).toHaveBeenLastCalledWith('/processos', { params: { page: 2, limit: 20 } });
    await service.getActiveProcesso();
    expect(api.get).toHaveBeenLastCalledWith('/processos/ativo');
    await service.getProcessoById(7);
    expect(api.get).toHaveBeenLastCalledWith('/processos/7');
    await service.getProcessoDashboard(7);
    expect(api.get).toHaveBeenLastCalledWith('/processos/7/dashboard');
    await service.getProcessoGeneralClosure(7);
    expect(api.get).toHaveBeenLastCalledWith('/processos/7/encerramento');
    await service.getProcessoAuxiliaryState(7);
    expect(api.get).toHaveBeenLastCalledWith('/processos/7/auxiliar');
    await service.getProcessoReadings(7, { page: 1, limit: 50 });
    expect(api.get).toHaveBeenLastCalledWith('/leituras-eventos/processos/7/leituras', {
      params: { page: 1, limit: 50 },
    });
    await service.getProcessoEvents(7);
    expect(api.get).toHaveBeenLastCalledWith('/leituras-eventos/processos/7/eventos');
  });

  it('preserva versões otimistas, leases e correlation_id no subsistema auxiliar', async () => {
    const lease = { expected_version: 3, duration_seconds: 120, motivo: 'Ajuste técnico' };
    const release = { expected_version: 4, motivo: 'Controle concluído' };
    const command = {
      expected_subsystem_version: 4,
      expected_tank_version: 8,
      correlation_id: 'front-test-123',
      motivo: 'Atuação supervisionada',
    };

    await service.acquireAuxiliaryPumpControl(5, lease);
    expect(api.post).toHaveBeenLastCalledWith('/processos/5/auxiliar/controle-bomba/assumir', lease);
    await service.releaseAuxiliaryPumpControl(5, release);
    expect(api.post).toHaveBeenLastCalledWith('/processos/5/auxiliar/controle-bomba/liberar', release);
    await service.acquireAuxiliaryValveControl(5, 12, lease);
    expect(api.post).toHaveBeenLastCalledWith(
      '/processos/5/tanques/12/auxiliar/controle-valvula/assumir',
      lease,
    );
    await service.releaseAuxiliaryValveControl(5, 12, release);
    expect(api.post).toHaveBeenLastCalledWith(
      '/processos/5/tanques/12/auxiliar/controle-valvula/liberar',
      release,
    );
    await service.turnOnAuxiliaryPump(5, 12, command);
    expect(api.post).toHaveBeenLastCalledWith('/processos/5/tanques/12/auxiliar/bomba/ligar', command);
    await service.turnOffAuxiliaryPump(5, command);
    expect(api.post).toHaveBeenLastCalledWith('/processos/5/auxiliar/bomba/desligar', command);
    await service.openAuxiliaryValve(5, 12, command);
    expect(api.post).toHaveBeenLastCalledWith('/processos/5/tanques/12/auxiliar/valvula/abrir', command);
    await service.closeAuxiliaryValve(5, 12, command);
    expect(api.post).toHaveBeenLastCalledWith('/processos/5/tanques/12/auxiliar/valvula/fechar', command);
  });

  it('usa contratos separados para encerramento, pré-checagem e válvulas', async () => {
    const closure = { expected_version: 6, motivo: 'Vácuo estabilizado' };
    await service.startProcessoTankClosure(8, 21, closure);
    expect(api.post).toHaveBeenLastCalledWith('/processos/8/tanques/21/encerramento/iniciar', closure);
    await service.finalizeProcessoGeneralClosure(8, closure);
    expect(api.post).toHaveBeenLastCalledWith('/processos/8/encerramento/finalizar', closure);

    await service.getPrechecagem(8);
    expect(api.get).toHaveBeenLastCalledWith('/processos/8/prechecagem');
    await service.executarPrechecagem(8);
    expect(api.post).toHaveBeenLastCalledWith('/processos/8/prechecagem/executar');
    await service.validarAcoplamentoTanque(8, 2);
    expect(api.post).toHaveBeenLastCalledWith('/processos/8/tanques/2/acoplamento/validar');
    await service.validarSensorProcesso(8, 14);
    expect(api.post).toHaveBeenLastCalledWith('/processos/8/sensores/14/validar');

    await service.listarValvulasProcesso(8);
    expect(api.get).toHaveBeenLastCalledWith('/processos/8/valvulas');
    await service.validarValvulaProcesso(8, 3);
    expect(api.post).toHaveBeenLastCalledWith('/processos/8/valvulas/3/validar');
    await service.abrirValvulaProcesso(8, 3);
    expect(api.post).toHaveBeenLastCalledWith('/processos/8/valvulas/3/abrir');
    await service.fecharValvulaProcesso(8, 3);
    expect(api.post).toHaveBeenLastCalledWith('/processos/8/valvulas/3/fechar');
  });
});
