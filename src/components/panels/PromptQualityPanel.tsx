import React from 'react'
import { useMetricsStore } from '../../stores/useMetricsStore'
import { Lightbulb } from 'lucide-react'

export const PromptQualityPanel: React.FC = () => {
  const { promptText, setPromptText, promptAnalysis } = useMetricsStore()
  const analysis = promptAnalysis

  const gradeClass = analysis
    ? analysis.grade.startsWith('A') ? 'grade-a'
      : analysis.grade.startsWith('B') ? 'grade-b'
      : analysis.grade.startsWith('C') ? 'grade-c'
      : 'grade-d'
    : ''

  return (
    <>
      {/* Prompt Input */}
      <div className="prompt-input-area">
        <textarea
          className="prompt-textarea"
          placeholder="Paste or type your prompt here to analyze quality..."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          rows={4}
        />
      </div>

      {/* Score Display */}
      <div className="metric-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className={`quality-badge ${gradeClass}`}>
          {analysis?.grade ?? '-'}
        </div>
        <div>
          <div className="metric-card-value" style={{ fontSize: 28 }}>
            {analysis?.score ?? 0}
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/100</span>
          </div>
          <div className="metric-card-sub">Prompt Quality Score</div>
        </div>
      </div>

      {/* Factor Breakdown */}
      {analysis?.factors && analysis.factors.length > 0 && (
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Quality Factors</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {analysis.factors.map((f) => (
              <div key={f.name} className="factor-bar-container">
                <div className="factor-bar-header">
                  <span className="factor-bar-label">{f.name}</span>
                  <span className="factor-bar-value">{f.score}</span>
                </div>
                <div className="factor-bar-track">
                  <div
                    className="factor-bar-fill"
                    style={{ width: `${f.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {analysis?.suggestions && analysis.suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {analysis.suggestions.map((s, i) => (
            <div key={i} className="suggestion-chip">
              <Lightbulb size={12} />
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
