import { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from './ProcessDetailsErrorBoundary.module.scss';

type ProcessDetailsErrorBoundaryProps = {
  children: ReactNode;
  resetKey?: number | string | null;
};

type ProcessDetailsErrorBoundaryState = {
  error: Error | null;
};

export class ProcessDetailsErrorBoundary extends Component<
  ProcessDetailsErrorBoundaryProps,
  ProcessDetailsErrorBoundaryState
> {
  state: ProcessDetailsErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ProcessDetailsErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Falha ao renderizar detalhes do processo.', error, info.componentStack);
  }

  componentDidUpdate(previousProps: ProcessDetailsErrorBoundaryProps): void {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <section className={styles.errorState} role="alert">
          <strong>Nao foi possivel renderizar os detalhes do processo.</strong>
          <span>{this.state.error.message}</span>
          <button type="button" onClick={() => this.setState({ error: null })}>
            Tentar novamente
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}
