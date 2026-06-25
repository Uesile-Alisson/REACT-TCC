import { RefreshCw, RotateCcw, Save } from 'lucide-react';
import { ConfiguracoesSistemaForm } from '../../components/configuracoes-sistema/ConfiguracoesSistemaForm';
import { useConfiguracoesSistema } from '../../hooks/useConfiguracoesSistema';
import { useConfiguracoesSistemaForm } from '../../hooks/useConfiguracoesSistemaForm';
import { useConfiguracoesSistemaPermissions } from '../../hooks/useConfiguracoesSistemaPermissions';
import styles from './ConfiguracoesSistemaPage.module.scss';

export function ConfiguracoesSistemaPage() {
  const {
    configuracao,
    endpointState,
    isLoading,
    isSaving,
    error,
    success,
    refresh,
    clearFeedback,
  } = useConfiguracoesSistema();
  const permissions = useConfiguracoesSistemaPermissions();
  const {
    formState,
    errors,
    isDirty,
    updateField,
    resetForm,
    validate,
  } = useConfiguracoesSistemaForm(configuracao);

  const endpointMissing = endpointState === 'missing';
  const readOnly = !permissions.canEditConfiguracoesSistema || endpointMissing;
  const canSave = permissions.canEditConfiguracoesSistema && isDirty && !isSaving && !endpointMissing;

  function handleSave(): void {
    const payload = validate();

    if (!payload) {
      return;
    }

    clearFeedback();
  }

  if (!permissions.canViewConfiguracoesSistema) {
    return (
      <main className={styles.page}>
        <section className={styles.errorState} role="alert">
          <strong>Acesso negado.</strong>
          <span>Seu perfil nao possui permissao para visualizar configuracoes do sistema.</span>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>TSEA / Parametros globais</p>
          <h1>Configuracoes do Sistema</h1>
          <p>Gerencie parametros gerais de operacao e seguranca do sistema TSEA.</p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" onClick={() => void refresh()} disabled={isLoading}>
            <RefreshCw size={16} aria-hidden="true" />
            {isLoading ? 'Atualizando' : 'Atualizar'}
          </button>
          <button type="button" onClick={resetForm} disabled={!isDirty || isSaving}>
            <RotateCcw size={16} aria-hidden="true" />
            Restaurar
          </button>
          <button type="button" onClick={handleSave} disabled={!canSave}>
            <Save size={16} aria-hidden="true" />
            {isSaving ? 'Salvando' : 'Salvar alteracoes'}
          </button>
        </div>
      </header>

      {error ? (
        <section className={styles.warningState} role="status">
          <strong>Configuracoes em modo leitura.</strong>
          <span>{error}</span>
        </section>
      ) : null}

      {success ? (
        <section className={styles.successState} role="status">
          <strong>{success}</strong>
          <button type="button" onClick={clearFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}

      {readOnly ? (
        <section className={styles.readOnlyState} role="status">
          <strong>Edicao indisponivel.</strong>
          <span>
            O front nao enviara alteracoes enquanto nao houver endpoint HTTP documentado para
            Configuracoes do Sistema.
          </span>
        </section>
      ) : null}

      <ConfiguracoesSistemaForm
        configuracao={configuracao}
        formState={formState}
        errors={errors}
        readOnly={readOnly}
        endpointMissing={endpointMissing}
        onChange={updateField}
      />

      {!configuracao ? (
        <section className={styles.emptyState} role="status">
          <strong>Nenhuma configuracao carregada pela API.</strong>
          <span>
            Campos internos confirmados no backend: vacuo_padrao,
            limite_seguranca_vacuo, tolerancia_vacuo_percentual e status_geral_sistema.
          </span>
        </section>
      ) : null}
    </main>
  );
}
