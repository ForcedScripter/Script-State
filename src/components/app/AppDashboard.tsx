import React, { useState } from 'react'
import { useMetricsStore } from '../../stores/useMetricsStore'
import { useWidgetStore } from '../../stores/useWidgetStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import {
  Code2, Minus, X, Coins, Award, Gauge, BarChart3, Settings,
  Hash, ArrowUpDown, DollarSign, Lightbulb, Eye, EyeOff,
  Keyboard, Info, Clock, Zap, Target, Activity
} from 'lucide-react'

const TABS = [
  { id: 'analysis', label: 'Analysis', icon: Coins },
  { id: 'quality', label: 'Quality', icon: Award },
  { id: 'context', label: 'Context', icon: Gauge },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export const AppDashboard: React.FC = () => {
  const [tab, setTab] = useState('analysis')
  const { detectedText, setDetectedText, selectedModel, setSelectedModel, models, tokenEstimate, promptAnalysis, source } = useMetricsStore()
  const settings = useSettingsStore()
  const { clipboardMonitoring, setClipboardMonitoring } = useWidgetStore()

  const closeApp = () => window.scriptState?.closeApp()
  const minimizeApp = () => window.scriptState?.minimizeApp()

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="app-header">
        <div className="app-header-left">
          <div className="app-logo"><Code2 size={12} /></div>
          <span className="app-title">Script State</span>
        </div>
        <div className="app-header-actions">
          <button className="w-btn" onClick={minimizeApp}><Minus size={13} /></button>
          <button className="w-btn close" onClick={closeApp}><X size={13} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="app-tabs">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button key={t.id} className={`app-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon size={13} />{t.label}
            </button>
          )
        })}
      </div>

      {/* Body */}
      <div className="app-body stagger" key={tab}>
        {/* Shared: prompt display */}
        {tab !== 'settings' && (
          <div>
            <textarea
              className="app-textarea"
              placeholder="Auto-detected prompt appears here, or paste manually…"
              value={detectedText}
              onChange={(e) => setDetectedText(e.target.value, 'manual')}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--t3)' }}>Model:</span>
              <select className="model-sel" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <span style={{ fontSize: 9, color: 'var(--t3)', marginLeft: 'auto' }}>
                Source: {source}
              </span>
            </div>
          </div>
        )}

        {/* ── Analysis Tab ── */}
        {tab === 'analysis' && <AnalysisTab est={tokenEstimate} analysis={promptAnalysis} />}

        {/* ── Quality Tab ── */}
        {tab === 'quality' && <QualityTab analysis={promptAnalysis} />}

        {/* ── Context Tab ── */}
        {tab === 'context' && <ContextTab est={tokenEstimate} selectedModel={selectedModel} models={models} />}

        {/* ── Metrics Tab ── */}
        {tab === 'metrics' && <MetricsTab est={tokenEstimate} analysis={promptAnalysis} selectedModel={selectedModel} settings={settings} />}

        {/* ── Settings Tab ── */}
        {tab === 'settings' && (
          <SettingsTab
            settings={settings}
            clipMon={clipboardMonitoring}
            setClipMon={setClipboardMonitoring}
          />
        )}
      </div>
    </div>
  )
}

/* ── Sub-panels ── */

const AnalysisTab: React.FC<{ est: any; analysis: any }> = ({ est, analysis }) => (
  <>
    <div className="card-grid">
      <div className="card">
        <div className="card-title"><Hash size={12} /> Input Tokens</div>
        <div className="card-value" style={{ color: 'var(--accent)' }}>{(est?.inputTokens ?? 0).toLocaleString()}</div>
      </div>
      <div className="card">
        <div className="card-title"><ArrowUpDown size={12} /> Output (est)</div>
        <div className="card-value" style={{ color: 'var(--accent2)' }}>{(est?.estimatedOutput ?? 0).toLocaleString()}</div>
      </div>
    </div>
    <div className="card">
      <div className="card-title"><DollarSign size={12} /> Estimated Cost</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: 11, color: 'var(--t3)' }}>$</span>
        <span className="card-value" style={{ color: 'var(--ok)' }}>{(est?.cost.total ?? 0).toFixed(6)}</span>
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
        <span className="card-sub">In: ${(est?.cost.input ?? 0).toFixed(6)}</span>
        <span className="card-sub">Out: ${(est?.cost.output ?? 0).toFixed(6)}</span>
      </div>
    </div>
    {analysis && (
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className={`q-badge ${analysis.grade.startsWith('A') ? 'a' : analysis.grade.startsWith('B') ? 'b' : analysis.grade.startsWith('C') ? 'c' : 'd'}`}>
          {analysis.grade}
        </div>
        <div>
          <div className="card-value" style={{ fontSize: 22 }}>
            {analysis.score}<span style={{ fontSize: 12, color: 'var(--t3)' }}>/100</span>
          </div>
          <div className="card-sub">Prompt Quality</div>
        </div>
      </div>
    )}
  </>
)

const QualityTab: React.FC<{ analysis: any }> = ({ analysis }) => (
  <>
    {analysis ? (
      <>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className={`q-badge ${analysis.grade.startsWith('A') ? 'a' : analysis.grade.startsWith('B') ? 'b' : analysis.grade.startsWith('C') ? 'c' : 'd'}`}>
            {analysis.grade}
          </div>
          <div>
            <div className="card-value" style={{ fontSize: 26 }}>{analysis.score}<span style={{ fontSize: 12, color: 'var(--t3)' }}>/100</span></div>
            <div className="card-sub">Prompt Quality Score</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Quality Factors</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {analysis.factors.map((f: any) => (
              <div key={f.name} className="factor">
                <div className="factor-head">
                  <span className="factor-name">{f.name}</span>
                  <span className="factor-val">{f.score}</span>
                </div>
                <div className="factor-track">
                  <div className="factor-fill" style={{ width: `${f.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {analysis.suggestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {analysis.suggestions.map((s: string, i: number) => (
              <div key={i} className="suggestion"><Lightbulb size={11} /><span>{s}</span></div>
            ))}
          </div>
        )}
      </>
    ) : (
      <div className="card"><div className="card-sub">Copy or type a prompt to see quality analysis</div></div>
    )}
  </>
)

const ContextTab: React.FC<{ est: any; selectedModel: string; models: any[] }> = ({ est, selectedModel, models }) => {
  const model = models.find((m) => m.id === selectedModel)
  const used = est?.contextUsage ?? 0
  const max = est?.maxContext ?? model?.maxContext ?? 128000
  const pct = max > 0 ? (used / max) * 100 : 0
  const fmt = (n: number) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : `${n}`
  const level = pct < 25 ? 'low' : pct < 60 ? 'mid' : pct < 85 ? 'high' : 'crit'
  const r = 50, sw = 7, circ = 2 * Math.PI * r, off = circ - (Math.min(pct, 100) / 100) * circ
  const color = pct < 40 ? 'var(--ok)' : pct < 70 ? 'var(--accent)' : pct < 90 ? 'var(--warn)' : 'var(--err)'

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
        <div className="ctx-gauge" style={{ width: 110, height: 110 }}>
          <svg width={110} height={110}>
            <circle className="ctx-gauge-bg" cx={55} cy={55} r={r} strokeWidth={sw} />
            <circle className="ctx-gauge-fill" cx={55} cy={55} r={r} strokeWidth={sw}
              stroke={color} strokeDasharray={circ} strokeDashoffset={off} />
          </svg>
          <div className="ctx-gauge-center">
            <span className="ctx-gauge-val" style={{ fontSize: 18, color }}>{pct.toFixed(1)}%</span>
            <span className="ctx-gauge-lbl">Used</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="card-title" style={{ margin: 0 }}>Context Window</span>
          <span className="card-sub">{model?.name ?? selectedModel}</span>
        </div>
        <div className="ctx-bar"><div className={`ctx-fill ${level}`} style={{ width: `${Math.min(pct,100)}%` }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span className="card-sub">{used.toLocaleString()} used</span>
          <span className="card-sub">{fmt(max)} max</span>
        </div>
      </div>
      <div className="card-grid">
        <div className="card">
          <div className="card-title">Remaining</div>
          <div className="card-value" style={{ fontSize: 16, color: 'var(--ok)' }}>{fmt(max - used)}</div>
        </div>
        <div className="card">
          <div className="card-title">Max Context</div>
          <div className="card-value" style={{ fontSize: 16, color: 'var(--accent2)' }}>{fmt(max)}</div>
        </div>
      </div>
    </>
  )
}

const MetricsTab: React.FC<{ est: any; analysis: any; selectedModel: string; settings: any }> = ({ est, analysis, selectedModel, settings }) => {
  const total = (est?.inputTokens ?? 0) + (est?.estimatedOutput ?? 0)
  return (
    <>
      <div className="card-sub" style={{ marginBottom: 4 }}>Live metrics · {selectedModel}</div>
      <div className="card-grid">
        {settings.showTokens && (
          <div className="card"><div className="card-title"><Zap size={12} />Total Tokens</div><div className="card-value" style={{ fontSize: 16 }}>{total.toLocaleString()}</div></div>
        )}
        {settings.showCost && (
          <div className="card"><div className="card-title"><Coins size={12} />Est. Cost</div><div className="card-value" style={{ fontSize: 16, color: 'var(--ok)' }}>${(est?.cost.total ?? 0).toFixed(6)}</div></div>
        )}
        {settings.showQuality && (
          <div className="card"><div className="card-title"><Target size={12} />Quality</div><div className="card-value" style={{ fontSize: 16, color: 'var(--accent)' }}>{analysis?.grade ?? '-'} <span style={{ fontSize: 10, color: 'var(--t3)' }}>{analysis?.score ?? 0}/100</span></div></div>
        )}
        {settings.showContext && (
          <div className="card"><div className="card-title"><Activity size={12} />Context</div><div className="card-value" style={{ fontSize: 16 }}>{est ? `${((est.contextUsage/est.maxContext)*100).toFixed(1)}%` : '0%'}</div></div>
        )}
        {settings.showLatency && (
          <div className="card"><div className="card-title"><Clock size={12} />Latency</div><div className="card-value" style={{ fontSize: 16, color: 'var(--t3)' }}>—</div><div className="card-sub">Connect API to track</div></div>
        )}
      </div>
    </>
  )
}

const SettingsTab: React.FC<{ settings: any; clipMon: boolean; setClipMon: (v: boolean) => void }> = ({ settings, clipMon, setClipMon }) => {
  const toggles = [
    { key: 'showTokens' as const, label: 'Token Counter', desc: 'Input/output token estimates', icon: Hash },
    { key: 'showQuality' as const, label: 'Prompt Quality', desc: 'Quality score and grade', icon: Award },
    { key: 'showContext' as const, label: 'Context Window', desc: 'Context utilization gauge', icon: Gauge },
    { key: 'showCost' as const, label: 'Cost Estimator', desc: 'Per-request cost projection', icon: DollarSign },
    { key: 'showLatency' as const, label: 'Latency Tracker', desc: 'Response time monitoring', icon: Clock },
  ]
  return (
    <>
      <div className="card">
        <div className="card-title"><Eye size={12} /> Auto-Detection</div>
        <div className="s-row">
          <div className="s-row-left">
            <div className="s-row-icon"><Eye size={13} /></div>
            <div>
              <div className="s-row-label">Clipboard Monitoring</div>
              <div className="s-row-desc">Auto-detect prompts from clipboard</div>
            </div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={clipMon} onChange={(e) => setClipMon(e.target.checked)} />
            <span className="toggle-track" />
          </label>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Visible Metrics</div>
        {toggles.map((t) => {
          const Icon = t.icon
          return (
            <div key={t.key} className="s-row">
              <div className="s-row-left">
                <div className="s-row-icon"><Icon size={13} /></div>
                <div><div className="s-row-label">{t.label}</div><div className="s-row-desc">{t.desc}</div></div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={settings[t.key]} onChange={() => settings.toggle(t.key)} />
                <span className="toggle-track" />
              </label>
            </div>
          )
        })}
      </div>
      <div className="card">
        <div className="card-title"><Keyboard size={12} /> Shortcuts</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0' }}>
          <span style={{ color: 'var(--t2)' }}>Toggle widget</span>
          <kbd style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--t3)', border: '1px solid var(--border-subtle)' }}>Ctrl+Shift+S</kbd>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0' }}>
          <span style={{ color: 'var(--t2)' }}>Open dashboard</span>
          <kbd style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--t3)', border: '1px solid var(--border-subtle)' }}>Double-click tray</kbd>
        </div>
      </div>
      <div className="card" style={{ opacity: 0.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Info size={11} />
          <span style={{ fontSize: 10, color: 'var(--t3)' }}>Script State v1.0.0 · AI Coding Companion</span>
        </div>
      </div>
    </>
  )
}
