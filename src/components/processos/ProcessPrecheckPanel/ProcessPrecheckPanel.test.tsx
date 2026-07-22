import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type {
  ProcessoPrecheckItem,
  ProcessoPrecheckResponse,
  ProcessoValvulaAcaoResponse,
} from '../../../types';
import { ProcessPrecheckPanel } from './ProcessPrecheckPanel';

const correctiveItem: ProcessoPrecheckItem = {
  codigo: 'VALVE_SAFE_STATE',
  titulo: 'Estado seguro da válvula não confirmado',
  grupo: 'VALVULAS',
  status: 'NAO_CONFIRMADO',
  obrigatorio: true,
  bloqueante: true,
  id_recurso: 3,
  mensagem: 'É necessária uma preparação segura global.',
  acao_corretiva: {
    codigo: 'TESTAR_ESTADO_SEGURO_VALVULA',
    titulo: 'Testar estado seguro da válvula',
    metodo: 'POST',
    endpoint: '/processos/9/valvulas/3/validar',
    disponivel: true,
    requer_confirmacao: true,
    reexecutar_prechecagem: true,
    motivo_indisponibilidade: null,
  },
};

function precheck(blocked: boolean): ProcessoPrecheckResponse {
  return {
    id_processo: 9,
    status_geral: blocked ? 'REPROVADO' : 'APROVADO',
    aprovado: !blocked,
    bloqueado: blocked,
    executado_em: new Date().toISOString(),
    validade_segundos: 60,
    itens: [blocked ? correctiveItem : { ...correctiveItem, status: 'APROVADO' }],
    falhas_bloqueantes: blocked ? ['Válvula sem confirmação lógica'] : [],
    avisos: [],
    recomendacoes: [],
  };
}

function renderPanel(
  currentPrecheck: ProcessoPrecheckResponse,
  valveResult?: ProcessoValvulaAcaoResponse,
) {
  const onCorrectiveAction = vi.fn();
  render(
    <ProcessPrecheckPanel
      precheck={currentPrecheck}
      valves={[{
        id_valvula: 3,
        nome_valvula: 'Válvula principal T1',
        tipo: 'PRINCIPAL',
        aberta: false,
        disponivel: true,
      }]}
      valveTestResults={valveResult ? { 3: valveResult } : {}}
      tanks={[]}
      sensors={[]}
      processStatus="CONFIGURADO"
      hasProcess
      isLoading={false}
      loadingAction={null}
      error={null}
      feedback={null}
      socketFeedback={null}
      onRefresh={vi.fn()}
      onExecute={vi.fn()}
      onValidateTank={vi.fn()}
      onCorrectiveAction={onCorrectiveAction}
      onOpenValve={vi.fn()}
      onCloseValve={vi.fn()}
      onClearFeedback={vi.fn()}
    />,
  );
  return onCorrectiveAction;
}

describe('ProcessPrecheckPanel', () => {
  it('mostra ação corretiva somente quando a pré-checagem bloqueia', () => {
    const { rerender } = render(
      <ProcessPrecheckPanel
        precheck={precheck(false)}
        valves={[]}
        valveTestResults={{}}
        tanks={[]}
        sensors={[]}
        hasProcess
        isLoading={false}
        loadingAction={null}
        error={null}
        feedback={null}
        socketFeedback={null}
        onRefresh={vi.fn()}
        onExecute={vi.fn()}
        onValidateTank={vi.fn()}
        onCorrectiveAction={vi.fn()}
        onOpenValve={vi.fn()}
        onCloseValve={vi.fn()}
        onClearFeedback={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Testar estado seguro da válvula' })).not.toBeInTheDocument();

    rerender(
      <ProcessPrecheckPanel
        precheck={precheck(true)}
        valves={[]}
        valveTestResults={{}}
        tanks={[]}
        sensors={[]}
        hasProcess
        isLoading={false}
        loadingAction={null}
        error={null}
        feedback={null}
        socketFeedback={null}
        onRefresh={vi.fn()}
        onExecute={vi.fn()}
        onValidateTank={vi.fn()}
        onCorrectiveAction={vi.fn()}
        onOpenValve={vi.fn()}
        onCloseValve={vi.fn()}
        onClearFeedback={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Testar estado seguro da válvula' })).toBeEnabled();
  });

  it('exige confirmação explícita e descreve o alcance global e lógico do teste', async () => {
    const user = userEvent.setup();
    const onCorrectiveAction = renderPanel(precheck(true));

    await user.click(screen.getByRole('button', { name: 'Testar estado seguro da válvula' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('desliga todas as bombas');
    expect(screen.getByRole('alertdialog')).toHaveTextContent('sem feedback mecanico dedicado');
    expect(onCorrectiveAction).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Executar teste seguro' }));
    expect(onCorrectiveAction).toHaveBeenCalledWith(correctiveItem);
  });

  it('diferencia falha, snapshot ausente, ACK recusado e limite do feedback mecânico', () => {
    renderPanel(precheck(true), {
      id_processo: 9,
      id_valvula: 3,
      acao: 'VALIDAR',
      status: 'FALHA',
      aprovado: false,
      mensagem: 'Preparação segura falhou.',
      evidencia: 'ACK recusado pelo ESP32',
      detalhes: {
        snapshot_recebido: false,
        estado_controlador_confirmado: false,
        feedback_mecanico_disponivel: false,
        motivo_nao_confirmacao: 'Broker desconectado antes do snapshot.',
        command_failures: [{ comando: 'FECHAR_VALVULAS', message: 'ACK recusado' }],
      },
      executado_em: new Date().toISOString(),
    });

    expect(screen.getByText(/^Falha$/)).toBeInTheDocument();
    expect(screen.getAllByText('Nao confirmado', { selector: 'dd' })).toHaveLength(2);
    expect(screen.getByText('Nao disponivel', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByText(/Broker desconectado antes do snapshot/)).toBeInTheDocument();
    expect(screen.getByText(/FECHAR_VALVULAS: ACK recusado/)).toBeInTheDocument();
  });
});
