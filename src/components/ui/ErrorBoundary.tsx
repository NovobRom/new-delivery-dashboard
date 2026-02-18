import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        {this.props.fallbackMessage || 'Something went wrong in this section.'}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
