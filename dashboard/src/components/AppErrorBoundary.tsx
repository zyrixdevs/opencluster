import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("OpenCluster dashboard render failure", {
      error,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.error) {
      return (
        <main className="app-error" role="alert">
          <h1>OpenCluster could not render this view</h1>
          <p>{this.state.error.message}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload dashboard
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
