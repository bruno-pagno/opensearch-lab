import { useEffect, useRef, useState } from 'react'

interface Props {
  query: string | null
  onDismiss: () => void
}

export function QueryLog({ query, onDismiss }: Props) {
  const [progress, setProgress] = useState(100)
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hovering = useRef(false)
  const remainingRef = useRef(100)

  useEffect(() => {
    if (!query) return
    setProgress(100)
    remainingRef.current = 100

    const duration = 5000
    const tickMs = 50
    const tickDelta = (tickMs / duration) * 100

    timerRef.current = setInterval(() => {
      if (hovering.current) return
      remainingRef.current = Math.max(0, remainingRef.current - tickDelta)
      setProgress(remainingRef.current)
      if (remainingRef.current === 0) {
        clearInterval(timerRef.current!)
        onDismiss()
      }
    }, tickMs)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [query])

  function copyQuery() {
    if (!query) return
    navigator.clipboard.writeText(query).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!query) return null

  return (
    <div
      className="fixed bottom-5 right-5 w-96 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in"
      onMouseEnter={() => { hovering.current = true }}
      onMouseLeave={() => { hovering.current = false }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-balearic" />
          <span className="text-xs font-semibold text-foggy uppercase tracking-wide">OpenSearch query</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyQuery}
            className="text-xs text-foggy hover:text-hof transition-colors flex items-center gap-1"
            aria-label="Copy query"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-balearic" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-hof transition-colors text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>

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
