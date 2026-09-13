import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080b1a] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,45,155,0.4)]">
            <span className="text-3xl font-black text-primary">F9</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">حدث خطأ غير متوقع</h1>
          <p className="text-gray-400 text-sm max-w-md mb-6 leading-relaxed">
            حدث خطأ أثناء تحميل الصفحة. يرجى إعادة المحاولة أو تحديث الصفحة.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent font-bold text-black hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]"
          >
            تحديث الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
