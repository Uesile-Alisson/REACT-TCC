import { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from './AppErrorBoundary.module.scss';

type AppErrorBoundaryProps = {
  children: ReactNode;
  resetKey?: string | number | null;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('Erro de renderizacao na area interna do TSEA.', error, errorInfo);
    }
  }

  componentDidUpdate(previousProps: AppErrorBoundaryProps): void {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private handleRetry = (): void => {
    this.setState({ error: null });
  };

  private handleGoHome = (): void => {
    this.setState({ error: null });
    window.location.assign('/dashboard');
  };

  render(): ReactNode {
    const { children } = this.props;
    const { error } = this.state;

    if (!error) {
      return children;
    }

    return (
      <section className={styles.fallback} role="alert">
        <div className={styles.content}>
          <span className={styles.overline}>TSEA / Recuperacao de tela</span>
          <h1>Nao foi possivel renderizar esta tela.</h1>
          <p>
            Uma falha visual foi isolada para manter o sistema acessivel. Tente recarregar a tela
            ou volte para o dashboard.
          </p>
          {import.meta.env.DEV ? <code>{error.message}</code> : null}
          <div className={styles.actions}>
            <button type="button" onClick={this.handleRetry}>
              Tentar novamente
            </button>
            <button type="button" onClick={this.handleGoHome}>
              Voltar para Home
            </button>
          </div>
        </div>
      </section>
    );
  }
}
