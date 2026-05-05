import React from 'react'
import { useWidgetStore } from '../../stores/useWidgetStore'
import { useMetricsStore } from '../../stores/useMetricsStore'
import { ChevronDown, Zap } from 'lucide-react'

export const PillMode: React.FC = () => {
  const toggleMode = useWidgetStore((s) => s.toggleMode)
  const tokenEstimate = useMetricsStore((s) => s.tokenEstimate)
  const promptAnalysis = useMetricsStore((s) => s.promptAnalysis)

  const tokens = tokenEstimate?.inputTokens ?? 0
  const contextPct = tokenEstimate
    ? Math.round((tokenEstimate.contextUsage / tokenEstimate.maxContext) * 100)
    : 0
  const quality = promptAnalysis?.grade ?? '-'

  return (
    <div className="pill-container drag-handle">
      <div className="pill-logo">
        <Zap />
      </div>

      <div className="pill-metrics">
        <div className="pill-metric">
          <span className="pill-metric-value">{tokens.toLocaleString()}</span>
          <span className="pill-metric-label">Tokens</span>
        </div>
        <div className="pill-metric">
          <span className="pill-metric-value">{contextPct}%</span>
          <span className="pill-metric-label">Context</span>
        </div>
        <div className="pill-metric">
          <span className="pill-metric-value">{quality}</span>
          <span className="pill-metric-label">Quality</span>
        </div>
      </div>

      <button className="pill-expand-btn no-drag" onClick={toggleMode} title="Expand panel">
        <ChevronDown size={14} />
      </button>
    </div>
  )
}
