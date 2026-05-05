import React from 'react'
import { useMetricsStore } from '../../stores/useMetricsStore'
import { useWidgetStore } from '../../stores/useWidgetStore'
import { Code2, Maximize2, Minus, Eye, EyeOff } from 'lucide-react'

export const Widget: React.FC = () => {
  const { detectedText, tokenEstimate, promptAnalysis, source, selectedModel, models, setSelectedModel } = useMetricsStore()
  const { clipboardMonitoring, setClipboardMonitoring } = useWidgetStore()

  const est = tokenEstimate
  const tokens = est?.inputTokens ?? 0
  const outTokens = est?.estimatedOutput ?? 0
  const cost = est?.cost.total ?? 0
  const grade = promptAnalysis?.grade ?? '-'
  const score = promptAnalysis?.score ?? 0
  const ctxPct = est ? ((est.contextUsage / est.maxContext) * 100) : 0

  const gradeColor = grade.startsWith('A') ? 'var(--ok)'
    : grade.startsWith('B') ? 'var(--accent)'
    : grade.startsWith('C') ? 'var(--warn)'
    : grade === '-' ? 'var(--t3)' : 'var(--err)'

  const openApp = () => window.scriptState?.openApp()
  const hideWidget = () => window.scriptState?.hideWidget()

  const truncate = (s: string, n: number) => s.length > n ? s.slice(0, n) + '…' : s

  return (
    <div className="widget-box">
      {/* Header */}
      <div className="w-header">
        <div className="w-brand">
          <div className="w-logo"><Code2 size={10} /></div>
          <span className="w-name">Script State</span>
        </div>
        <div className="w-actions">
          <button
            className="w-btn"
            onClick={() => setClipboardMonitoring(!clipboardMonitoring)}
            title={clipboardMonitoring ? 'Pause monitoring' : 'Resume monitoring'}
          >
            {clipboardMonitoring ? <Eye size={11} /> : <EyeOff size={11} />}
          </button>
          <button className="w-btn" onClick={openApp} title="Open dashboard">
            <Maximize2 size={11} />
          </button>
          <button className="w-btn close" onClick={hideWidget} title="Hide (Ctrl+Shift+S to restore)">
            <Minus size={11} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="w-body">
        {/* Source indicator */}
        <div className="w-source">
          <span className={`w-source-dot ${source !== 'idle' ? 'active' : 'idle'}`} />
          {source === 'idle' ? 'Waiting for prompt…' : `Auto-detected · ${source}`}
        </div>

        {/* Detected text preview */}
        {detectedText && (
          <div className="w-preview" title={detectedText}>
            {truncate(detectedText, 80)}
          </div>
        )}

        {/* Metrics */}
        <div className="w-metrics">
          <div className="w-metric">
            <span className="w-metric-val" style={{ color: 'var(--accent)' }}>{tokens.toLocaleString()}</span>
            <span className="w-metric-lbl">Tokens</span>
          </div>
          <div className="w-metric">
            <span className="w-metric-val" style={{ color: gradeColor }}>{grade}</span>
            <span className="w-metric-lbl">Quality</span>
          </div>
          <div className="w-metric">
            <span className="w-metric-val" style={{ color: ctxPct > 80 ? 'var(--err)' : ctxPct > 50 ? 'var(--warn)' : 'var(--ok)' }}>
              {ctxPct.toFixed(1)}%
            </span>
            <span className="w-metric-lbl">Context</span>
          </div>
          <div className="w-metric">
            <span className="w-metric-val" style={{ color: 'var(--ok)' }}>
              ${cost < 0.01 ? cost.toFixed(4) : cost.toFixed(2)}
            </span>
            <span className="w-metric-lbl">Cost</span>
          </div>
        </div>

        {/* Quality bar */}
        <div className="w-quality-bar">
          <div className="w-quality-fill" style={{ width: `${score}%` }} />
        </div>
      </div>

      {/* Footer */}
      <div className="w-footer">
        <button className="w-open-app" onClick={openApp}>Full Analysis</button>
        <select
          className="w-model-sel"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
