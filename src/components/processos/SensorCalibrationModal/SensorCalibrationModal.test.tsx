import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as sensorService from '../../../services/configuracoes-sensores.service';
import type { SensorConfiguracaoResponse } from '../../../types';
import { SensorCalibrationModal } from './SensorCalibrationModal';

vi.mock('../../../services/configuracoes-sensores.service', () => ({
  activateSensorConfiguracao: vi.fn(),
  deactivateSensorConfiguracao: vi.fn(),
  finishSensorCalibration: vi.fn(),
  getSensorConfiguracao: vi.fn(),
  listSensoresConfiguracao: vi.fn(),
  startSensorCalibration: vi.fn(),
  updateSensorConfiguracao: vi.fn(),
}));

function sensor(overrides: Partial<SensorConfiguracaoResponse> = {}): SensorConfiguracaoResponse {
  return {
    id_sensor: 14,
    nome: 'Vacuo T1',
    modelo: 'MPX-01',
    protocolo: 'ANALOGICO',
    unidade_medida: 'kPa',
    precisao: 0.5,
    status_sensor: 'INATIVO',
    tipo_sensor: 'VACUO',
    fator_calibracao: 1,
    offset_calibracao: 0,
    status_integridade: 'PENDENTE_CALIBRACAO',
    ultimo_valor_bruto: -79.5,
    calibrado_em: null,
    calibracao_valida_ate: null,
    calibracao_referencia: null,
    calibracao_incerteza: null,
    calibracao_observacoes: null,
    id_usuario_calibracao: null,
    liberado_em: null,
    id_usuario_liberacao: null,
    integridade_validada_em: null,
    integridade_ultimo_erro: 'Calibracao obrigatoria.',
    modo_calibracao_ativo: false,
    calibracao_iniciada_em: null,
    limite_minimo_operacional: -100,
    limite_maximo_operacional: -5,
    variacao_maxima_por_segundo: 12,
    oscilacao_maxima: 2,
    tempo_travado_segundos: 30,
    criado_em: '2026-07-21T12:00:00.000Z',
    ...overrides,
  };
}

function renderModal(currentSensor: SensorConfiguracaoResponse) {
  const onSensorMutated = vi.fn().mockResolvedValue(undefined);
  vi.mocked(sensorService.listSensoresConfiguracao).mockResolvedValue({
    data: [currentSensor],
    meta: { page: 1, limit: 100, total: 1, total_pages: 1 },
  });
  vi.mocked(sensorService.getSensorConfiguracao).mockResolvedValue(currentSensor);

  render(
    <SensorCalibrationModal
      isOpen
      initialSensorId={currentSensor.id_sensor}
      correctiveActionCode="CALIBRAR_SENSOR"
      correctiveActionTitle="Calibrar sensor bloqueante"
      onClose={vi.fn()}
      onSensorMutated={onSensorMutated}
    />,
  );

  return onSensorMutated;
}

describe('SensorCalibrationModal', () => {
  beforeEach(() => {
    vi.mocked(sensorService.activateSensorConfiguracao).mockReset();
    vi.mocked(sensorService.deactivateSensorConfiguracao).mockReset();
    vi.mocked(sensorService.finishSensorCalibration).mockReset();
    vi.mocked(sensorService.startSensorCalibration).mockReset();
    vi.mocked(sensorService.updateSensorConfiguracao).mockReset();
  });

  it('carrega a lista global, o diagnostico e inicia calibracao somente apos confirmacao', async () => {
    const user = userEvent.setup();
    const currentSensor = sensor();
    const calibratingSensor = sensor({
      modo_calibracao_ativo: true,
      calibracao_iniciada_em: '2026-07-21T13:00:00.000Z',
    });
    vi.mocked(sensorService.startSensorCalibration).mockResolvedValue(calibratingSensor);
    const onSensorMutated = renderModal(currentSensor);

    expect(await screen.findByRole('heading', { name: 'Vacuo T1' })).toBeInTheDocument();
    expect(screen.getByText('Calibrar sensor bloqueante')).toBeInTheDocument();
    expect(screen.getByText('Calibracao obrigatoria.')).toBeInTheDocument();
    expect(screen.getByText('-100 kPa a -5 kPa')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Iniciar calibracao' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('ausencia de processo ativo');
    expect(sensorService.startSensorCalibration).not.toHaveBeenCalled();

    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', {
      name: 'Iniciar calibracao',
    }));
    await waitFor(() => expect(sensorService.startSensorCalibration).toHaveBeenCalledWith(14));
    expect(onSensorMutated).toHaveBeenCalledOnce();
    expect(await screen.findByText('Finalizar com referencia rastreavel')).toBeInTheDocument();
  });

  it('finaliza calibracao com referencia rastreavel e mantem a liberacao separada', async () => {
    const user = userEvent.setup();
    const calibratingSensor = sensor({
      modo_calibracao_ativo: true,
      calibracao_iniciada_em: '2026-07-21T13:00:00.000Z',
    });
    const calibratedSensor = sensor({
      modo_calibracao_ativo: false,
      status_integridade: 'VALIDO',
      calibrado_em: '2026-07-21T14:00:00.000Z',
      calibracao_referencia: 'Padrao LAB-2026-014',
      fator_calibracao: 1.006289,
    });
    vi.mocked(sensorService.finishSensorCalibration).mockResolvedValue(calibratedSensor);
    const onSensorMutated = renderModal(calibratingSensor);

    await user.type(await screen.findByLabelText('Valor de referencia'), '-80');
    await user.type(screen.getByLabelText('Referencia rastreavel'), 'Padrao LAB-2026-014');
    await user.click(screen.getByRole('button', { name: 'Finalizar calibracao' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('liberacao tecnica permanecera separada');

    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', {
      name: 'Finalizar calibracao',
    }));
    await waitFor(() => expect(sensorService.finishSensorCalibration).toHaveBeenCalledWith(14, {
      valor_referencia: -80,
      valor_observado: -79.5,
      offset_calibracao: 0,
      referencia: 'Padrao LAB-2026-014',
      incerteza: undefined,
      valida_ate: undefined,
      observacoes: undefined,
    }));
    expect(onSensorMutated).toHaveBeenCalledOnce();
    expect(await screen.findByText(/sensor ainda precisa de liberacao tecnica/i)).toBeInTheDocument();
  });

  it('ativa e libera tecnicamente um sensor calibrado somente apos confirmacao', async () => {
    const user = userEvent.setup();
    const calibratedSensor = sensor({ status_integridade: 'VALIDO' });
    const activeSensor = sensor({
      status_sensor: 'ATIVO',
      status_integridade: 'VALIDO',
      liberado_em: '2026-07-21T15:00:00.000Z',
      id_usuario_liberacao: 2,
    });
    vi.mocked(sensorService.activateSensorConfiguracao).mockResolvedValue(activeSensor);
    const onSensorMutated = renderModal(calibratedSensor);

    await user.click(await screen.findByRole('button', { name: 'Ativar / liberar' }));
    expect(sensorService.activateSensorConfiguracao).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Ativar sensor' }));

    await waitFor(() => expect(sensorService.activateSensorConfiguracao).toHaveBeenCalledWith(14));
    expect(onSensorMutated).toHaveBeenCalledOnce();
    expect(await screen.findByText(/Sensor ativado\/liberado/)).toBeInTheDocument();
  });
});
