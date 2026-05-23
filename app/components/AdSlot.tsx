'use client'
import { useEffect, useRef, useState } from 'react'

interface AdSlotProps {
  slot: string
  format?: string
  className?: string
}

export function AdSlot({ slot, format = 'auto', className = '' }: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null)
  // Lazy initializer: always false on first render (show slot by default).
  // The effect below detects blocked/unfilled ads and sets hidden=true after
  // the fact — this is intentional deferred behavior, not a stale-state bug.
  const [hidden, setHidden] = useState<boolean>(() => false)

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
    <aside
      aria-label="Advertisement"
      className={`min-h-[90px] flex items-center justify-center w-full max-w-[1080px] mx-auto px-5 py-2 ${className}`}
    >
      <ins
        ref={insRef}
        className="adsbygoogle w-full text-center"
        style={{ display: 'block', width: '100%', minWidth: 0 }}
        data-ad-client="pub-6028271541011678"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  )
}
