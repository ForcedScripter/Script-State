import React from 'react'
import { useMetricsStore } from '../../stores/useMetricsStore'
import { GaugeRing } from '../shared/GaugeRing'
import { AnimatedCounter } from '../shared/AnimatedCounter'

export const ContextWindowPanel: React.FC = () => {
  const { tokenEstimate, selectedModel, models } = useMetricsStore()
  const est = tokenEstimate
  const model = models.find((m) => m.id === selectedModel)

  const used = est?.contextUsage ?? 0
  const max = est?.maxContext ?? model?.maxContext ?? 128000
  const pct = max > 0 ? (used / max) * 100 : 0

  const getLevel = () => {
    if (pct < 25) return 'low'
    if (pct < 60) return 'medium'
    if (pct < 85) return 'high'
    return 'critical'
  }

  const remaining = max - used

  const formatNum = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }

  return (
    <>
      {/* Gauge */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
        <GaugeRing
          value={pct}
          size={120}
          strokeWidth={8}
          label="Used"
          displayValue={`${pct.toFixed(1)}%`}
        />
      </div>

      {/* Context Bar */}
      <div className="metric-card">
        <div className="metric-card-header">
          <span className="metric-card-title">Context Window</span>
          <span className="metric-card-sub">{model?.name ?? selectedModel}</span>
        </div>
        <div className="context-bar" style={{ marginTop: 8 }}>
          <div className={`context-bar-fill ${getLevel()}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span className="metric-card-sub">
            <AnimatedCounter value={used} /> used
          </span>
          <span className="metric-card-sub">
            {formatNum(max)} max
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-card-title" style={{ marginBottom: 4 }}>Remaining</div>
          <div className="metric-card-value" style={{ fontSize: 16, color: 'var(--success)' }}>
            {formatNum(remaining)}
          </div>
          <div className="metric-card-sub">tokens available</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-title" style={{ marginBottom: 4 }}>Max Context</div>
          <div className="metric-card-value" style={{ fontSize: 16, color: 'var(--accent-violet)' }}>
            {formatNum(max)}
          </div>
          <div className="metric-card-sub">token limit</div>
        </div>
      </div>

      {/* Warning */}
      {pct > 80 && (
        <div className="suggestion-chip" style={{
          background: 'var(--warning-dim)',
          borderColor: 'rgba(245, 158, 11, 0.2)',
        }}>
          <span style={{ color: 'var(--warning)', fontSize: 11 }}>
            ⚠ Context window is {pct.toFixed(0)}% full. Consider shortening your prompt or switching to a model with a larger context window.
          </span>
        </div>
      )}
    </>
  )
}
