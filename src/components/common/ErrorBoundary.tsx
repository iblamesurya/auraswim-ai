import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuraSwim Uncaught Exception:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full p-8 rounded-2xl bg-neutral-950 border border-white/20 space-y-6 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/20 flex items-center justify-center mx-auto text-white">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight">System State Interrupted</h1>
              <p className="text-xs text-neutral-400 leading-relaxed font-mono">
                {this.state.error?.message || 'An unexpected rendering constraint occurred.'}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.99]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart AuraSwim Engine</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
