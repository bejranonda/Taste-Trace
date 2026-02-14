/**
 * ErrorBoundary Component - Graceful error handling
 */
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback, showRetry = true, message = 'Something went wrong' } = this.props;

      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <p className="text-gray-700 font-medium mb-1">{message}</p>
          <p className="text-gray-400 text-sm mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {showRetry && (
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use
export function ErrorBoundary({ children, ...props }) {
  return <ErrorBoundaryClass {...props}>{children}</ErrorBoundaryClass>;
}

// Error message component
export function ErrorMessage({ error, onRetry }) {
  return (
    <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
        <div className="flex-1">
          <p className="text-red-700 text-sm font-medium">
            {error?.message || 'An error occurred'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-red-600 text-sm underline mt-1 hover:text-red-700"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
