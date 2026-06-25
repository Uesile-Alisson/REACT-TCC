import { useState } from 'react';
import type { AlarmeResponse } from '../../../types';
import styles from './ResolverAlarmeModal.module.scss';

type ResolverAlarmeModalProps = {
  alarme: AlarmeResponse | null;
  isResolving: boolean;
  onClose: () => void;
  onConfirm: (idAlarme: number, observacao: string) => Promise<void>;
};

export function ResolverAlarmeModal({
  alarme,
  isResolving,
  onClose,
  onConfirm,
}: ResolverAlarmeModalProps) {
  const [observacao, setObservacao] = useState<string>('');

  if (!alarme) {
    return null;
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="resolve-title">
      <section className={styles.modal}>
        <header>
          <p>Confirmacao</p>
          <h2 id="resolve-title">Resolver alarme</h2>
        </header>

        <p>
          Confirme a resolucao de <strong>{alarme.tipo_alarme ?? `Alarme #${alarme.id_alarme}`}</strong>.
          A API validara permissao e estado atual.
        </p>

        <label>
          Observacao
          <textarea value={observacao} onChange={(event) => setObservacao(event.target.value)} />
        </label>

        <footer>
          <button type="button" onClick={onClose} disabled={isResolving}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void onConfirm(alarme.id_alarme, observacao)}
            disabled={isResolving}
          >
            {isResolving ? 'Resolvendo' : 'Confirmar'}
          </button>
        </footer>
      </section>
    </div>
  );
}
