import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error caught by ErrorBoundary:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <div className="max-w-md">
            <h1 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-6">
              We hit a temporary problem loading this page. Please try again.
            </p>
            <button
              onClick={this.handleReload}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2.5 rounded-md transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
