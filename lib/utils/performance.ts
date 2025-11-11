/**
 * Performance Tracking Utility
 * Provides simple console-based performance monitoring for development
 * and production environments.
 */

export class PerformanceTracker {
  private static timings = new Map<string, number>();
  private static enabled = process.env.NODE_ENV === 'development' || process.env.ENABLE_PERF_LOGGING === 'true';
  
  /**
   * Start timing an operation
   */
  static start(label: string) {
    if (!this.enabled) return;
    this.timings.set(label, performance.now());
  }
  
  /**
   * End timing an operation and log the duration
   * @returns Duration in milliseconds or null if disabled
   */
  static end(label: string): number | null {
    if (!this.enabled) return null;
    
    const start = this.timings.get(label);
    if (!start) {
      console.warn(`[PERF] No start time for "${label}"`);
      return null;
    }
    
    const duration = performance.now() - start;
    const formattedDuration = duration.toFixed(2);
    
    // Color code by duration (only works in Node.js terminal)
    const color = duration < 100 ? '\x1b[32m' :  // Green (<100ms)
                  duration < 500 ? '\x1b[33m' :  // Yellow (100-500ms)
                  '\x1b[31m';                     // Red (>500ms)
    
    console.log(`${color}[PERF]\x1b[0m ${label}: ${formattedDuration}ms`);
    
    this.timings.delete(label);
    return duration;
  }
  
  /**
   * Measure an async operation
   * @param label Label for the operation
   * @param fn Async function to measure
   * @returns Result of the function
   */
  static async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
  
  /**
   * Enable or disable performance tracking
   */
  static setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
  
  /**
   * Get current enabled state
   */
  static isEnabled(): boolean {
    return this.enabled;
  }
}

