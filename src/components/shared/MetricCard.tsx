import React from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  accent?: string
  children?: React.ReactNode
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, sub, icon, accent, children }) => (
  <div className="metric-card">
    <div className="metric-card-header">
      <span className="metric-card-title">
        {icon}{title}
      </span>
    </div>
    <div className="metric-card-value" style={accent ? { color: accent } : undefined}>
      {value}
    </div>
    {sub && <div className="metric-card-sub">{sub}</div>}
    {children}
  </div>
)
