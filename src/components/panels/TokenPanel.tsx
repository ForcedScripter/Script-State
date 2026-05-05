import React from 'react'
import { useMetricsStore } from '../../stores/useMetricsStore'
import { AnimatedCounter } from '../shared/AnimatedCounter'
import { Hash, ArrowUpDown, DollarSign } from 'lucide-react'

export const TokenPanel: React.FC = () => {
  const { promptText, setPromptText, selectedModel, setSelectedModel, models, tokenEstimate } = useMetricsStore()

  const est = tokenEstimate

  return (
    <>
      {/* Prompt Input */}
      <div className="prompt-input-area">
        <textarea
          className="prompt-textarea"
          placeholder="Paste or type your prompt here to analyze..."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          rows={4}
        />
      </div>

      {/* Model Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Model:</span>
        <select
          className="model-selector"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Token Metrics Grid */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title"><Hash size={13} /> Input</span>
          </div>
          <div className="metric-card-value" style={{ color: 'var(--accent-cyan)' }}>
            <AnimatedCounter value={est?.inputTokens ?? 0} />
          </div>
          <div className="metric-card-sub">tokens</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title"><ArrowUpDown size={13} /> Output (est)</span>
          </div>
          <div className="metric-card-value" style={{ color: 'var(--accent-violet)' }}>
            <AnimatedCounter value={est?.estimatedOutput ?? 0} />
          </div>
          <div className="metric-card-sub">tokens</div>
        </div>
      </div>

      {/* Cost Estimate */}
      <div className="metric-card">
        <div className="metric-card-header">
          <span className="metric-card-title"><DollarSign size={13} /> Estimated Cost</span>
        </div>
        <div className="cost-display">
          <span className="cost-symbol">$</span>
          <span className="cost-value">
            <AnimatedCounter value={est?.cost.total ?? 0} decimals={6} />
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
          <span className="metric-card-sub">
            In: ${est?.cost.input?.toFixed(6) ?? '0.000000'}
          </span>
          <span className="metric-card-sub">
            Out: ${est?.cost.output?.toFixed(6) ?? '0.000000'}
          </span>
        </div>
      </div>
    </>
  )
}
