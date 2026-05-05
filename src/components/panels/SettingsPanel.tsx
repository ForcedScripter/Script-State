import React from 'react'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { ToggleSwitch } from '../shared/ToggleSwitch'
import { Hash, Award, Gauge, DollarSign, Clock, Zap, Keyboard, Info } from 'lucide-react'

const METRIC_TOGGLES = [
  { key: 'showTokens' as const, label: 'Token Counter', desc: 'Input/output token estimates', icon: Hash },
  { key: 'showQuality' as const, label: 'Prompt Quality', desc: 'Quality score and grade', icon: Award },
  { key: 'showContext' as const, label: 'Context Window', desc: 'Context utilization gauge', icon: Gauge },
  { key: 'showCost' as const, label: 'Cost Estimator', desc: 'Per-request cost projection', icon: DollarSign },
  { key: 'showLatency' as const, label: 'Latency Tracker', desc: 'Response time monitoring', icon: Clock },
  { key: 'showThroughput' as const, label: 'Throughput', desc: 'Tokens per second', icon: Zap },
]

export const SettingsPanel: React.FC = () => {
  const settings = useSettingsStore()

  return (
    <>
      {/* Metric Toggles */}
      <div className="metric-card">
        <div className="metric-card-header">
          <span className="metric-card-title">Visible Metrics</span>
        </div>
        <div style={{ marginTop: 8 }}>
          {METRIC_TOGGLES.map((toggle) => {
            const Icon = toggle.icon
            return (
              <div key={toggle.key} className="settings-row">
                <div className="settings-row-left">
                  <div className="settings-row-icon"><Icon size={14} /></div>
                  <div>
                    <div className="settings-row-label">{toggle.label}</div>
                    <div className="settings-row-desc">{toggle.desc}</div>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings[toggle.key]}
                  onChange={() => settings.toggle(toggle.key)}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Shortcuts */}
      <div className="metric-card">
        <div className="metric-card-header">
          <span className="metric-card-title"><Keyboard size={13} /> Keyboard Shortcuts</span>
        </div>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Toggle widget</span>
            <kbd style={{
              padding: '2px 6px', background: 'rgba(255,255,255,0.06)',
              borderRadius: 4, fontSize: 10, fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)', border: '1px solid var(--border-subtle)'
            }}>Ctrl+Shift+N</kbd>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="metric-card" style={{ opacity: 0.7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={12} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            NeuralPulse v1.0.0 · AI Prompt Copilot
          </span>
        </div>
      </div>
    </>
  )
}
