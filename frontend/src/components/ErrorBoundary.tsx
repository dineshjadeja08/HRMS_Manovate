/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI instead of crashing the app
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, send to error tracking service like Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error tracking service
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 rounded-full p-4">
                  <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-slate-800 text-center mb-4">
                Oops! Something went wrong
              </h1>

              {/* Description */}
              <p className="text-slate-600 text-center mb-6">
                We're sorry for the inconvenience. An unexpected error has occurred.
                Please try reloading the page or contact support if the problem persists.
              </p>

              {/* Error Details (only in development) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">
                    Error Details:
                  </h3>
                  <p className="text-sm text-red-600 font-mono mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs text-slate-600 font-mono">
                      <summary className="cursor-pointer hover:text-slate-800">
                        Component Stack
                      </summary>
                      <pre className="mt-2 overflow-auto max-h-48 bg-white p-2 rounded border border-gray-200">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={this.handleReload}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 rounded-lg font-medium transition-colors"
                >
                  Go to Home
                </button>
              </div>

              {/* Support Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  Need help?{' '}
                  <a
                    href="mailto:support@manovate.com"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
