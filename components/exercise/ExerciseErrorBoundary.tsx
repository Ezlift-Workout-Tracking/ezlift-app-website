'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ExerciseErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class ExerciseErrorBoundary extends React.Component<ExerciseErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ExerciseErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Exercise Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card>
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                An error occurred while loading this exercise. Please try refreshing the page.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Refresh Page
              </Button>
              <Button 
                onClick={() => this.setState({ hasError: false })}
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-muted rounded-md">
                <summary className="cursor-pointer font-medium">Error Details</summary>
                <pre className="mt-2 text-sm text-muted-foreground overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ExerciseErrorBoundary; 