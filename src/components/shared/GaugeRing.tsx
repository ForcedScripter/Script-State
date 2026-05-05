import React from 'react'

interface GaugeRingProps {
  value: number      // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  displayValue?: string
}

export const GaugeRing: React.FC<GaugeRingProps> = ({
  value, size = 80, strokeWidth = 6, color, label, displayValue,
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(value, 100) / 100) * circumference

  const getColor = () => {
    if (color) return color
    if (value < 40) return 'var(--success)'
    if (value < 70) return 'var(--accent-cyan)'
    if (value < 90) return 'var(--warning)'
    return 'var(--error)'
  }

  return (
    <div className="gauge-ring-container" style={{ width: size, height: size }}>
      <svg className="gauge-ring-svg" width={size} height={size}>
        <circle className="gauge-ring-bg" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <circle
          className="gauge-ring-fill"
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
          stroke={getColor()}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="gauge-ring-center">
        <span className="gauge-ring-value" style={{ fontSize: size * 0.22, color: getColor() }}>
          {displayValue ?? `${Math.round(value)}%`}
        </span>
        {label && <span className="gauge-ring-label">{label}</span>}
      </div>
    </div>
  )
}
