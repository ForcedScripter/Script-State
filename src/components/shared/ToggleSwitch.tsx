import React from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, id }) => (
  <label className="toggle-switch">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className="toggle-track" />
  </label>
)
