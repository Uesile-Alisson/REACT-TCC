import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../api/axios';
import * as service from './mqtt-hardware.service';

vi.mock('../api/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
  },
}));

describe('mqtt-hardware.service — contratos HTTP', () => {
  beforeEach(() => {
    const response = { data: { message: 'ok' } };
    vi.mocked(api.get).mockResolvedValue(response);
    vi.mocked(api.post).mockResolvedValue(response);
    vi.mocked(api.patch).mockResolvedValue(response);
    vi.mocked(api.put).mockResolvedValue(response);
  });

  it('separa configuração não sensível de credenciais', async () => {
    const config = { topico_configuracoes: 'tsea/config', topico_acks: 'tsea/acks' };
    const credentials = { usuario_mqtt: 'usuario', senha_mqtt: 'segredo-temporario' };

    await service.getMqttHardwareStatus();
    expect(api.get).toHaveBeenLastCalledWith('/mqtt-hardware/status');
    await service.getMqttHardwareConfig();
    expect(api.get).toHaveBeenLastCalledWith('/mqtt-hardware/config');
    await service.updateMqttHardwareConfig(config);
    expect(api.patch).toHaveBeenLastCalledWith('/mqtt-hardware/config', config);
    await service.updateMqttHardwareCredentials(credentials);
    expect(api.put).toHaveBeenLastCalledWith('/mqtt-hardware/credentials', credentials);
    expect(api.patch).not.toHaveBeenCalledWith(
      '/mqtt-hardware/config',
      expect.objectContaining({ senha_mqtt: expect.anything() }),
    );
  });

  it('expõe todos os comandos globais suportados', async () => {
    const payload = { motivo: 'Teste supervisionado', correlation_id: 'front-mqtt-test' };
    const calls: Array<[() => Promise<unknown>, string, boolean]> = [
      [service.testMqttConnection, 'test', false],
      [service.reconnectMqtt, 'reconnect', false],
      [service.disconnectMqtt, 'disconnect', false],
      [() => service.syncHardware(payload), 'sincronizar-hardware', true],
      [() => service.restartCommunication(payload), 'reiniciar-comunicacao', true],
      [() => service.emergencyStopHardware(payload), 'parada-emergencia', true],
      [() => service.turnOffAllPumps(payload), 'desligar-todas-bombas', true],
      [() => service.openAllValves(payload), 'abrir-todas-valvulas', true],
      [() => service.closeAllValves(payload), 'fechar-todas-valvulas', true],
    ];

    for (const [execute, command, hasPayload] of calls) {
      await execute();
      expect(api.post).toHaveBeenLastCalledWith(
        `/mqtt-hardware/commands/${command}`,
        hasPayload ? payload : undefined,
      );
    }
  });
});
