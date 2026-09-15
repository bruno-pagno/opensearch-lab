import { useEffect, useRef, useState } from 'react'

interface Props {
  query: string | null
  onDismiss: () => void
}

export function QueryLog({ query, onDismiss }: Props) {
  const [progress, setProgress] = useState(100)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!query) return
    setProgress(100)

    const duration = 5000
    const start = Date.now()

    timerRef.current = setInterval(() => {
      const pct = Math.max(0, 100 - ((Date.now() - start) / duration) * 100)
      setProgress(pct)
      if (pct === 0) {
        clearInterval(timerRef.current!)
        onDismiss()
      }
    }, 50)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [query])

  if (!query) return null

  return (
    <div className="fixed bottom-5 right-5 w-96 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-balearic" />
          <span className="text-xs font-semibold text-foggy uppercase tracking-wide">OpenSearch query</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-hof transition-colors text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Countdown bar */}
      <div className="h-0.5 bg-gray-100">
        <div
          className="h-0.5 bg-rausch transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      <pre className="px-4 py-3 text-xs font-mono text-hof overflow-x-auto max-h-52 leading-relaxed">{query}</pre>
    </div>
  )
}
