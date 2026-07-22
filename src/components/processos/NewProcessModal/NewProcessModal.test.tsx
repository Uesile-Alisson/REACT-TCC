import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProcessoConfiguracaoOptions } from '../../../hooks/useProcessoConfiguracaoOptions';
import { NewProcessModal } from './NewProcessModal';

vi.mock('../../../hooks/useProcessoConfiguracaoOptions', () => ({
  useProcessoConfiguracaoOptions: vi.fn(),
}));

const loadSensoresForTanque = vi.fn().mockResolvedValue(undefined);

describe('NewProcessModal', () => {
  beforeEach(() => {
    vi.mocked(useProcessoConfiguracaoOptions).mockReturnValue({
      tanqueOptions: [
        { id_tanque: 1, label: 'Tanque 1', description: 'T1', codigo_hardware: 'TANQUE_1' },
        { id_tanque: 2, label: 'Tanque 2', description: 'T2', codigo_hardware: 'TANQUE_2' },
        { id_tanque: 3, label: 'Tanque 3', description: 'T3', codigo_hardware: 'TANQUE_3' },
      ],
      sensorOptions: [],
      sensorOptionsByTanque: {
        1: [{ id_sensor: 11, label: 'Vácuo T1', description: 'kPa', status_sensor: 'ATIVO' }],
        2: [{ id_sensor: 12, label: 'Vácuo T2', description: 'kPa', status_sensor: 'ATIVO' }],
        3: [{ id_sensor: 13, label: 'Vácuo T3', description: 'kPa', status_sensor: 'ATIVO' }],
      },
      loadingTanques: false,
      loadingSensores: false,
      loadingHardware: false,
      loadingSystemConfig: false,
      loadingSensoresByTanque: {},
      errorTanques: null,
      errorSensores: null,
      errorHardware: null,
      errorSystemConfig: null,
      errorSensoresByTanque: {},
      valvulasByTanque: {
        TANQUE_1: {
          principal: { codigo_hardware: 'VALVULA_T1_PRINCIPAL' },
          auxiliar: { codigo_hardware: 'VALVULA_T1_AUXILIAR' },
        },
        TANQUE_2: {
          principal: { codigo_hardware: 'VALVULA_T2_PRINCIPAL' },
          auxiliar: { codigo_hardware: 'VALVULA_T2_AUXILIAR' },
        },
        TANQUE_3: {
          principal: { codigo_hardware: 'VALVULA_T3_PRINCIPAL' },
          auxiliar: { codigo_hardware: 'VALVULA_T3_AUXILIAR' },
        },
      },
      maxTanksPerProcess: 3,
      selectedTanqueId: null,
      setSelectedTanqueId: vi.fn(),
      reloadTanques: vi.fn().mockResolvedValue(undefined),
      loadSensoresForTanque,
    });
  });

  it('oferece os três modos, limite dinâmico e prioridade apenas no automático/assistido', async () => {
    const user = userEvent.setup();
    render(<NewProcessModal isOpen isSubmitting={false} onClose={vi.fn()} onSubmit={vi.fn()} />);

    const mode = screen.getByLabelText(/Modo de operacao auxiliar/);
    expect(within(mode).getAllByRole('option').map((option) => option.getAttribute('value'))).toEqual([
      'AUTOMATICO',
      'ASSISTIDO',
      'MANUAL',
    ]);
    const quantity = screen.getByLabelText(/Quantidade de tanques/);
    expect(within(quantity).getAllByRole('option')).toHaveLength(3);

    await user.selectOptions(quantity, '2');
    expect(screen.getAllByText('Configuracao individual')).toHaveLength(2);
    expect(screen.getAllByLabelText('Prioridade auxiliar')).toHaveLength(2);

    await user.selectOptions(mode, 'MANUAL');
    expect(screen.queryByLabelText('Prioridade auxiliar')).not.toBeInTheDocument();
    expect(screen.getByText(/automacao apenas monitora e recomenda/i)).toBeInTheDocument();
  });

  it('submete vácuo manométrico negativo em kPa com os campos contratuais', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<NewProcessModal isOpen isSubmitting={false} onClose={vi.fn()} onSubmit={onSubmit} />);

    const vacuum = screen.getByLabelText('Vacuo alvo do tanque');
    expect(vacuum).toHaveAttribute('max', '-0.001');
    expect(vacuum).not.toHaveAttribute('min', '0');

    await user.type(screen.getByLabelText('Tempo maximo (segundos)'), '900');
    await user.selectOptions(screen.getByLabelText('Tanque'), '1');
    await user.selectOptions(screen.getByLabelText('Sensor de vacuo'), '11');
    await user.type(vacuum, '-80');
    await user.click(screen.getByRole('button', { name: 'Configurar processo' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      tempo_maximo: '900',
      modo_operacao_auxiliar: 'AUTOMATICO',
      encerramento_automatico: true,
      tanques: [expect.objectContaining({
        id_tanque: '1',
        id_sensor: '11',
        vacuo_alvo_tanque: '-80',
      })],
    })));
  });
});
