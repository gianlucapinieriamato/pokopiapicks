'use client'
import { useEffect, useRef, useState } from 'react'

interface AdSlotProps {
  slot: string
  format?: string
  className?: string
}

export function AdSlot({ slot, format = 'auto', className = '' }: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agl = (window as any).adsbygoogle
    if (!agl?.loaded) {
      setHidden(true)
      return
    }
    const ins = insRef.current
    if (!ins || ins.getAttribute('data-adsbygoogle-status')) return
    try {
      agl.push({})
    } catch {
      setHidden(true)
      return
    }
    // hide if slot didn't fill after AdSense had time to respond
    const timer = setTimeout(() => {
      if (ins.getAttribute('data-adsbygoogle-status') !== 'done') setHidden(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (hidden) return null

  return (
    <div className={`w-full text-center ${className}`}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minWidth: 0 }}
        data-ad-client="pub-6028271541011678"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
