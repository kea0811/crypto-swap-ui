/**
 * Performance monitoring utilities
 * These utilities help track and optimize application performance
 */

interface PerformanceMetrics {
  renderTime: number
  apiCallDuration: number
  cacheHitRate: number
}

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  private cacheHits = 0
  private cacheMisses = 0

  /**
   * Start timing an operation
   */
  startTimer(label: string): () => void {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      this.recordMetric(label, duration)

      if (import.meta.env.DEV) {
        console.debug(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
      }
    }
  }

  /**
   * Record a metric value
   */
  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }

    const values = this.metrics.get(label)
    if (!values) return

    values.push(value)

    // Keep only last 100 values to prevent memory leaks
    if (values.length > 100) {
      values.shift()
    }
  }

  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.cacheHits++
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(): void {
    this.cacheMisses++
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses
    if (total === 0) return 0
    return (this.cacheHits / total) * 100
  }

  /**
   * Get average metric value
   */
  getAverageMetric(label: string): number {
    const values = this.metrics.get(label)
    if (!values || values.length === 0) return 0

    const sum = values.reduce((acc, val) => acc + val, 0)
    return sum / values.length
  }

  /**
   * Get all metrics summary
   */
  getMetricsSummary(): PerformanceMetrics {
    return {
      renderTime: this.getAverageMetric('render'),
      apiCallDuration: this.getAverageMetric('api-call'),
      cacheHitRate: this.getCacheHitRate(),
    }
  }

  /**
   * Clear all metrics
   */
  reset(): void {
    this.metrics.clear()
    this.cacheHits = 0
    this.cacheMisses = 0
  }
}

export const perfMonitor = new PerformanceMonitor()

/**
 * React hook for measuring component render time
 */
export function useMeasureRender(componentName: string): void {
  if (import.meta.env.PROD) return

  const endTimer = perfMonitor.startTimer(`render-${componentName}`)

  // Measure after render
  requestAnimationFrame(() => {
    endTimer()
  })
}
