import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-background">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 mx-auto rounded-full border border-destructive/30 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive/60" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display text-xl text-foreground">
                Une erreur s'est produite
              </h2>
              <p className="text-sm text-muted-foreground">
                Quelque chose n'a pas fonctionné comme prévu. 
                Tu peux essayer de recharger la page ou réessayer.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-destructive/5 border border-destructive/20 text-xs text-destructive/80 text-left overflow-auto max-h-32">
                <code>{this.state.error.message}</code>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="border-border/50"
              >
                Réessayer
              </Button>
              <Button
                onClick={this.handleReload}
                className="bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recharger
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
