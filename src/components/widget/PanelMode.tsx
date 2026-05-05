import React from 'react'
import { useWidgetStore } from '../../stores/useWidgetStore'
import { Zap, ChevronUp, Minus, Coins, Award, Gauge, BarChart3, Settings } from 'lucide-react'
import { TokenPanel } from '../panels/TokenPanel'
import { PromptQualityPanel } from '../panels/PromptQualityPanel'
import { ContextWindowPanel } from '../panels/ContextWindowPanel'
import { MetricsPanel } from '../panels/MetricsPanel'
import { SettingsPanel } from '../panels/SettingsPanel'

const TABS = [
  { id: 'tokens', label: 'Tokens', icon: Coins },
  { id: 'quality', label: 'Quality', icon: Award },
  { id: 'context', label: 'Context', icon: Gauge },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export const PanelMode: React.FC = () => {
  const toggleMode = useWidgetStore((s) => s.toggleMode)
  const activeTab = useWidgetStore((s) => s.activeTab)
  const setActiveTab = useWidgetStore((s) => s.setActiveTab)

  const minimize = () => window.neuralPulse?.minimize()

  const renderTab = () => {
    switch (activeTab) {
      case 'tokens': return <TokenPanel />
      case 'quality': return <PromptQualityPanel />
      case 'context': return <ContextWindowPanel />
      case 'metrics': return <MetricsPanel />
      case 'settings': return <SettingsPanel />
      default: return <TokenPanel />
    }
  }

  return (
    <div className="panel-container">
      {/* Header */}
      <div className="panel-header drag-handle">
        <div className="panel-header-left">
          <div className="pill-logo" style={{ width: 22, height: 22 }}>
            <Zap size={11} />
          </div>
          <span className="panel-title">NeuralPulse</span>
        </div>
        <div className="panel-header-actions">
          <button className="panel-btn no-drag" onClick={toggleMode} title="Collapse to pill">
            <ChevronUp size={14} />
          </button>
          <button className="panel-btn close no-drag" onClick={minimize} title="Hide widget">
            <Minus size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="panel-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`panel-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Body */}
      <div className="panel-body stagger-children" key={activeTab}>
        {renderTab()}
      </div>
    </div>
  )
}
