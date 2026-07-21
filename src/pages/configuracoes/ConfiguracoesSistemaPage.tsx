import { RefreshCw, RotateCcw, Save } from 'lucide-react';
import { BackupQuickActions } from '../../components/backups/BackupQuickActions';
import { RealDataChartPanel } from '../../components/charts/RealDataChartPanel';
import { ConfiguracoesSistemaForm } from '../../components/configuracoes-sistema/ConfiguracoesSistemaForm';
import { useConfiguracoesSistema } from '../../hooks/useConfiguracoesSistema';
import { useConfiguracoesSistemaForm } from '../../hooks/useConfiguracoesSistemaForm';
import { useConfiguracoesSistemaPermissions } from '../../hooks/useConfiguracoesSistemaPermissions';
import { useAuth } from '../../hooks/useAuth';
import styles from './ConfiguracoesSistemaPage.module.scss';

export function ConfiguracoesSistemaPage() {
  const { user } = useAuth();
  const {
    configuracao,
    isLoading,
    isSaving,
    error,
    success,
    refresh,
    saveConfiguracao,
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

  const readOnly = !permissions.canEditConfiguracoesSistema || isLoading || isSaving || !configuracao;
  const canSave = permissions.canEditConfiguracoesSistema && isDirty && !isSaving && Boolean(configuracao);
  const canUseBackups = user?.nivel_acesso === 'ADMINISTRADOR';
  const parametrosVacuo = configuracao
    ? [
        { name: 'Vacuo padrao', value: configuracao.vacuo_padrao },
        { name: 'Limite seguranca', value: configuracao.limite_seguranca_vacuo },
        { name: 'Tolerancia %', value: configuracao.tolerancia_vacuo_percentual },
      ]
    : [];

  function handleSave(): void {
    const payload = validate();

    if (!payload) {
      return;
    }

    clearFeedback();
    void saveConfiguracao(payload);
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
          <strong>Nao foi possivel sincronizar.</strong>
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

      {!permissions.canEditConfiguracoesSistema ? (
        <section className={styles.readOnlyState} role="status">
          <strong>Edicao indisponivel.</strong>
          <span>Seu perfil nao possui permissao para alterar configuracoes do sistema.</span>
        </section>
      ) : null}

      <BackupQuickActions
        title="Backups das configuracoes do sistema"
        description="Gere ou restaure snapshots de parametros globais. Backups completos tambem podem restaurar esta camada."
        generateType="SISTEMA"
        restoreTypes={['SISTEMA', 'COMPLETO']}
        canUseBackups={canUseBackups}
        restoreTitle="Restaurar backup do sistema"
      />

      <ConfiguracoesSistemaForm
        configuracao={configuracao}
        formState={formState}
        errors={errors}
        readOnly={readOnly}
        onChange={updateField}
      />

      <section className={styles.chartGrid} aria-label="Grafico de configuracoes do sistema">
        <RealDataChartPanel
          title="Parametros globais de vacuo"
          subtitle="Valores atualmente sincronizados com a API de configuracoes."
          data={parametrosVacuo}
          variant="bar"
        />
      </section>

      {isLoading ? (
        <section className={styles.emptyState} role="status">
          <strong>Carregando configuracoes.</strong>
          <span>Aguarde enquanto os parametros atuais sao lidos da API.</span>
        </section>
      ) : null}

      {!isLoading && !configuracao ? (
        <section className={styles.emptyState} role="status">
          <strong>Nenhuma configuracao carregada pela API.</strong>
          <span>
            Verifique a API e as permissoes para carregar os parametros operacionais globais.
          </span>
        </section>
      ) : null}
    </main>
  );
}
