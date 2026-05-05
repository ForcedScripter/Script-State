import React, { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value, duration = 400, prefix = '', suffix = '', decimals = 0, className,
}) => {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)
  const rafRef = useRef<number>(undefined)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const current = from + (to - from) * eased
      setDisplay(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        prevRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration])

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString()

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
