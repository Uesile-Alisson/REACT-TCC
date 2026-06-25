import { useState } from 'react';
import type { GerarRelatorioFormState, TipoRelatorio } from '../../../types';
import styles from './GerarRelatorioModal.module.scss';

type GerarRelatorioModalProps = {
  isOpen: boolean;
  isGenerating: boolean;
  onClose: () => void;
  onConfirm: (formState: GerarRelatorioFormState) => Promise<boolean>;
};

const initialState: GerarRelatorioFormState = {
  tipo: 'PROCESSO',
  idOrigem: '',
  gerarPdf: true,
  gerarXlsx: false,
  observacao: '',
};

export function GerarRelatorioModal({
  isOpen,
  isGenerating,
  onClose,
  onConfirm,
}: GerarRelatorioModalProps) {
  const [formState, setFormState] = useState<GerarRelatorioFormState>(initialState);

  if (!isOpen) {
    return null;
  }

  function handleClose(): void {
    setFormState(initialState);
    onClose();
  }

  function updateTipo(tipo: TipoRelatorio): void {
    setFormState((currentState) => ({
      ...currentState,
      tipo,
      gerarPdf: true,
      gerarXlsx: tipo === 'PROCESSO' ? currentState.gerarXlsx : false,
      idOrigem: '',
    }));
  }

  async function handleConfirm(): Promise<void> {
    const success = await onConfirm(formState);

    if (success) {
      handleClose();
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="generate-report-title">
      <section className={styles.modal}>
        <header>
          <p>Geracao tecnica</p>
          <h2 id="generate-report-title">Novo relatorio</h2>
        </header>

        <div className={styles.segmented} aria-label="Tipo de relatorio">
          <button
            type="button"
            className={formState.tipo === 'PROCESSO' ? styles.active : undefined}
            onClick={() => updateTipo('PROCESSO')}
          >
            Processo
          </button>
          <button
            type="button"
            className={formState.tipo === 'ALARME' ? styles.active : undefined}
            onClick={() => updateTipo('ALARME')}
          >
            Alarme
          </button>
        </div>

        <label>
          {formState.tipo === 'ALARME' ? 'ID do alarme' : 'ID do processo'}
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={formState.idOrigem}
            onChange={(event) =>
              setFormState((currentState) => ({ ...currentState, idOrigem: event.target.value }))
            }
          />
        </label>

        <fieldset>
          <legend>Formato</legend>
          <label>
            <input
              type="checkbox"
              checked={formState.gerarPdf}
              onChange={(event) =>
                setFormState((currentState) => ({ ...currentState, gerarPdf: event.target.checked }))
              }
            />
            PDF
          </label>
          <label className={formState.tipo === 'ALARME' ? styles.disabledOption : undefined}>
            <input
              type="checkbox"
              checked={formState.gerarXlsx}
              disabled={formState.tipo === 'ALARME'}
              onChange={(event) =>
                setFormState((currentState) => ({ ...currentState, gerarXlsx: event.target.checked }))
              }
            />
            XLSX
          </label>
        </fieldset>

        <label>
          Observacao
          <textarea
            value={formState.observacao}
            onChange={(event) =>
              setFormState((currentState) => ({ ...currentState, observacao: event.target.value }))
            }
          />
        </label>

        <footer>
          <button type="button" onClick={handleClose} disabled={isGenerating}>
            Cancelar
          </button>
          <button type="button" onClick={() => void handleConfirm()} disabled={isGenerating}>
            {isGenerating ? 'Gerando' : 'Gerar'}
          </button>
        </footer>
      </section>
    </div>
  );
}
