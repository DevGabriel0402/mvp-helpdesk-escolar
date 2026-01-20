import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, color: '#ff6b6b', background: 'rgba(255,0,0,0.1)', borderRadius: 8, border: '1px solid #ff6b6b' }}>
                    <h3 style={{ marginTop: 0 }}>Algo deu errado na exibição.</h3>
                    <p>Erro: {this.state.error?.toString()}</p>
                    <details style={{ marginTop: 10, opacity: 0.8 }}>
                        <summary>Detalhes técnicos</summary>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', marginTop: 10 }}>
                            {this.state.error?.stack}
                        </pre>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
