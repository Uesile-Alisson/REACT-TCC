import { useState } from 'react';
import type { HistoricoProcessoResponse } from '../../../types';
import styles from './GerarRelatorioHistoricoModal.module.scss';

type GerarRelatorioHistoricoModalProps = {
  processo: HistoricoProcessoResponse | null;
  isGenerating: boolean;
  onClose: () => void;
  onConfirm: (idProcesso: number, observacao: string) => Promise<void>;
};

export function GerarRelatorioHistoricoModal({
  processo,
  isGenerating,
  onClose,
  onConfirm,
}: GerarRelatorioHistoricoModalProps) {
  const [observacao, setObservacao] = useState<string>('');

  if (!processo) {
    return null;
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="report-title">
      <section className={styles.modal}>
        <header>
          <p>Relatorio de processo</p>
          <h2 id="report-title">{processo.nome_processo ?? `Processo #${processo.id_processo}`}</h2>
        </header>
        <p>
          Sera solicitada a geracao de relatorio PDF pelo endpoint real. A consulta do arquivo fica
          na tela de Relatorios.
        </p>
        <label>
          Observacao
          <textarea value={observacao} onChange={(event) => setObservacao(event.target.value)} />
        </label>
        <footer>
          <button type="button" onClick={onClose} disabled={isGenerating}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void onConfirm(processo.id_processo, observacao)}
            disabled={isGenerating}
          >
            {isGenerating ? 'Gerando' : 'Gerar relatorio'}
          </button>
        </footer>
      </section>
    </div>
  );
}
