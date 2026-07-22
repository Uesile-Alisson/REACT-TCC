import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../api/axios';
import * as service from './configuracoes-sensores.service';

vi.mock('../api/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('configuracoes-sensores.service — contratos HTTP', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [] } });
    vi.mocked(api.post).mockResolvedValue({ data: { id_sensor: 4 } });
    vi.mocked(api.patch).mockResolvedValue({ data: { id_sensor: 4 } });
  });

  it('cria na rota global e mantém a consulta aninhada somente para o tanque', async () => {
    await service.listSensoresVacuoByTanque(2);
    expect(api.get).toHaveBeenLastCalledWith('/configuracoes/tanques/2/sensores', {
      params: {
        status_sensor: 'ATIVO',
        tipo_sensor: 'VACUO',
        order_by: 'nome',
        order_direction: 'asc',
      },
    });

    const payload = {
      nome: 'Sensor de vácuo T2',
      modelo: 'VX-1',
      protocolo: 'ANALOGICO' as const,
      tipo_sensor: 'VACUO' as const,
      status_sensor: 'INATIVO' as const,
      unidade_medida: 'kPa',
    };
    await service.createSensorConfiguracao(payload);
    expect(api.post).toHaveBeenLastCalledWith('/configuracoes/sensores', payload);
  });

  it('cobre listagem global, detalhe, edição e ciclo técnico de calibração', async () => {
    await service.listSensoresConfiguracao({ page: 1, limit: 25 });
    expect(api.get).toHaveBeenLastCalledWith('/configuracoes/sensores', {
      params: { page: 1, limit: 25 },
    });
    await service.getSensorConfiguracao(4);
    expect(api.get).toHaveBeenLastCalledWith('/configuracoes/sensores/4');

    await service.updateSensorConfiguracao(4, { nome: 'Sensor revisado' });
    expect(api.patch).toHaveBeenLastCalledWith('/configuracoes/sensores/4', {
      nome: 'Sensor revisado',
    });
    await service.startSensorCalibration(4);
    expect(api.post).toHaveBeenLastCalledWith('/configuracoes/sensores/4/calibracao/iniciar');

    const calibration = { valor_referencia: -80, referencia: 'Padrão LAB-01' };
    await service.finishSensorCalibration(4, calibration);
    expect(api.post).toHaveBeenLastCalledWith(
      '/configuracoes/sensores/4/calibracao/finalizar',
      calibration,
    );
    await service.activateSensorConfiguracao(4);
    expect(api.patch).toHaveBeenLastCalledWith('/configuracoes/sensores/4/ativar');
    await service.deactivateSensorConfiguracao(4);
    expect(api.patch).toHaveBeenLastCalledWith('/configuracoes/sensores/4/desativar');
  });
});
