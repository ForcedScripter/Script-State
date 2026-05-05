import React from 'react'
import { useMetricsStore } from '../../stores/useMetricsStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { MetricCard } from '../shared/MetricCard'
import { AnimatedCounter } from '../shared/AnimatedCounter'
import { Clock, Zap, Coins, Target, Activity } from 'lucide-react'

export const MetricsPanel: React.FC = () => {
  const { tokenEstimate, promptAnalysis, selectedModel } = useMetricsStore()
  const settings = useSettingsStore()

  const est = tokenEstimate
  const totalTokens = (est?.inputTokens ?? 0) + (est?.estimatedOutput ?? 0)

  return (
    <>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
        Live metrics for current prompt · {selectedModel}
      </div>

      <div className="metric-grid">
        {settings.showTokens && (
          <MetricCard
            title="Total Tokens"
            value=""
            icon={<Zap size={13} />}
          >
            <div className="metric-card-value" style={{ fontSize: 18 }}>
              <AnimatedCounter value={totalTokens} />
            </div>
          </MetricCard>
        )}

        {settings.showCost && (
          <MetricCard
            title="Est. Cost"
            value=""
            icon={<Coins size={13} />}
          >
            <div className="cost-display">
              <span className="cost-symbol">$</span>
              <span className="cost-value" style={{ fontSize: 18 }}>
                <AnimatedCounter value={est?.cost.total ?? 0} decimals={6} />
              </span>
            </div>
          </MetricCard>
        )}

        {settings.showQuality && (
          <MetricCard
            title="Quality"
            value=""
            icon={<Target size={13} />}
          >
            <div className="metric-card-value" style={{ fontSize: 18, color: 'var(--accent-cyan)' }}>
              {promptAnalysis?.grade ?? '-'}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
                {promptAnalysis?.score ?? 0}/100
              </span>
            </div>
          </MetricCard>
        )}

        {settings.showContext && (
          <MetricCard
            title="Context"
            value=""
            icon={<Activity size={13} />}
          >
            <div className="metric-card-value" style={{ fontSize: 18 }}>
              {est ? `${((est.contextUsage / est.maxContext) * 100).toFixed(1)}%` : '0%'}
            </div>
          </MetricCard>
        )}

        {settings.showLatency && (
          <MetricCard
            title="Avg Latency"
            value=""
            icon={<Clock size={13} />}
          >
            <div className="metric-card-value" style={{ fontSize: 18, color: 'var(--text-muted)' }}>
              —
            </div>
            <div className="metric-card-sub">Connect an API to track</div>
          </MetricCard>
        )}

        {settings.showThroughput && (
          <MetricCard
            title="Throughput"
            value=""
            icon={<Zap size={13} />}
          >
            <div className="metric-card-value" style={{ fontSize: 18, color: 'var(--text-muted)' }}>
              —
            </div>
            <div className="metric-card-sub">tokens/sec</div>
          </MetricCard>
        )}
      </div>
    </>
  )
}
