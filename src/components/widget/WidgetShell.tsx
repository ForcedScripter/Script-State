import React, { useEffect } from 'react'
import { useWidgetStore } from '../../stores/useWidgetStore'
import { useMetricsStore } from '../../stores/useMetricsStore'
import { PillMode } from './PillMode'
import { PanelMode } from './PanelMode'

export const WidgetShell: React.FC = () => {
  const mode = useWidgetStore((s) => s.mode)
  const loadModels = useMetricsStore((s) => s.loadModels)

  useEffect(() => {
    loadModels()
  }, [loadModels])

  return (
    <div className="widget-shell">
      <div className="widget-container">
        {mode === 'pill' ? <PillMode /> : <PanelMode />}
      </div>
    </div>
  )
}
