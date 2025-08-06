'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a chunk loading error
    const isChunkError = error.message?.includes('Loading chunk') || 
                        error.message?.includes('ChunkLoadError') ||
                        error.name === 'ChunkLoadError'
    
    return { 
      hasError: isChunkError,
      error: isChunkError ? error : undefined
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log chunk errors for debugging
    if (error.message?.includes('Loading chunk') || error.name === 'ChunkLoadError') {
      console.error('Chunk loading error detected:', error)
      console.error('Error info:', errorInfo)
    }
  }

  handleRetry = () => {
    // Clear the error state and reload the page to get fresh chunks
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-soft p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.764 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-heading font-semibold text-warm-gray-900 mb-2">
              Loading Error
            </h2>
            
            <p className="text-warm-gray-600 mb-6">
              There was a problem loading part of the application. This usually happens when the app was updated while you were using it.
            </p>
            
            <button
              onClick={this.handleRetry}
              className="w-full bg-sage-600 hover:bg-sage-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
            >
              Reload Application
            </button>
            
            <p className="text-sm text-warm-gray-500 mt-4">
              If this keeps happening, try clearing your browser cache.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
