import { Component, ReactNode } from 'react';
import { Button } from './Button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">
                Oops! Something went wrong
              </h1>

              <p className="text-slate-400 mb-8 leading-relaxed">
                We're sorry, but something unexpected happened. This error has been logged and our team will look into it.
              </p>

              {this.state.error && (
                <div className="mb-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700 text-left">
                  <p className="text-sm text-slate-500 mb-2 font-mono">Error Details:</p>
                  <p className="text-sm text-red-400 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex items-center justify-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reload Page
                </Button>
                <Button
                  size="lg"
                  onClick={this.handleReset}
                  className="flex items-center justify-center"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Button>
              </div>

              <p className="text-slate-500 text-sm mt-8">
                If this problem persists, please contact our support team at{' '}
                <a href="mailto:support@clearcoursestudio.com" className="text-blue-400 hover:text-blue-300">
                  support@clearcoursestudio.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
