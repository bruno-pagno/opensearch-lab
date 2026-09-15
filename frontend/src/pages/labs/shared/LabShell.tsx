import { useState } from 'react'
import { navigate } from '../../../utils/navigate'

// ─── Types ────────────────────────────────────────────────────────────────────

type StepStatus = 'pending' | 'active' | 'done'

export interface StepState {
  status: StepStatus
  response: unknown | null
  loading: boolean
  error: string | null
}

export interface StepDef {
  id: number
  title: string
  type: 'observe' | 'action' | 'fix' | 'setup'
  visual?: React.ReactNode
  what: string
  why: string
  devMethod?: string
  devPath?: string
  devBody?: string
  apiPath?: string
  apiMethod?: string
  apiBody?: object
  insight: string
  insightType: 'info' | 'warning' | 'success'
  onResponse?: (data: unknown) => void
}

export interface LabConfig {
  number: number
  title: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  description: string
  completionText: string
  steps: StepDef[]
}

// ─── Shared visuals ───────────────────────────────────────────────────────────

export function GreenCluster() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded-full bg-green-500 shadow shadow-green-300" />
        <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Green — healthy</span>
      </div>
      <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-5 w-full max-w-sm">
        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-3 text-center">Cluster</p>
        <div className="rounded-xl border-2 border-gray-200 bg-white p-4">
          <p className="text-[10px] font-bold text-foggy uppercase tracking-widest mb-3 text-center">node-1</p>
          <div className="bg-rausch/10 border border-rausch/40 rounded-lg px-4 py-3 text-center">
            <p className="text-sm font-bold text-rausch">P0</p>
            <p className="text-[10px] text-rausch/70">primary · STARTED</p>
          </div>
          <p className="text-[10px] text-center text-foggy mt-2">replicas: 0</p>
        </div>
      </div>
      <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
        1 primary · 0 replicas · all shards assigned
      </div>
    </div>
  )
}

export function YellowCluster({ reason }: { reason?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded-full bg-yellow-400 shadow shadow-yellow-300 animate-pulse" />
        <span className="text-xs font-bold text-yellow-600 uppercase tracking-wide">Yellow — degraded</span>
      </div>
      <div className="rounded-2xl border-2 border-yellow-300 bg-yellow-50 p-5 w-full max-w-sm">
        <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mb-3 text-center">Cluster</p>
        <div className="flex gap-3 items-start">
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 flex-1">
            <p className="text-[10px] font-bold text-foggy uppercase tracking-widest mb-3 text-center">node-1</p>
            <div className="bg-rausch/10 border border-rausch/40 rounded-lg px-3 py-2 text-center">
              <p className="text-sm font-bold text-rausch">P0</p>
              <p className="text-[10px] text-rausch/70">STARTED</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center pt-5">
            <div className="rounded-xl border-2 border-dashed border-red-300 bg-red-50 p-3 text-center w-20">
              <p className="text-sm font-bold text-red-400">R0</p>
              <p className="text-[10px] text-red-400 leading-tight">UNAS-<br/>SIGNED</p>
            </div>
            {reason && <p className="text-[9px] text-red-400 font-bold text-center leading-tight mt-1 max-w-[80px]">{reason}</p>}
          </div>
        </div>
      </div>
      <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-center">
        unassigned shard — cluster has no redundancy
      </div>
    </div>
  )
}

// ─── DevCmd ───────────────────────────────────────────────────────────────────

export function DevCmd({ method, path, body }: { method: string; path: string; body?: string }) {
  const [copied, setCopied] = useState(false)
  const color = { GET: 'text-emerald-400', PUT: 'text-yellow-400', POST: 'text-blue-400', DELETE: 'text-red-400' }[method] ?? 'text-white'

  function copy() {
    const text = body ? `${method} ${path}\n${body}` : `${method} ${path}`
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
  }

  return (
    <div className="rounded-xl bg-gray-950 border border-gray-800 overflow-hidden">
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="ml-1 text-[10px] text-gray-500 uppercase tracking-wide">DevTools</span>
        </div>
        <button onClick={copy} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      <div className="px-4 py-3 font-mono text-sm">
        <span className={`font-bold ${color}`}>{method}</span>
        <span className="text-sky-300"> {path}</span>
        {body && <pre className="mt-1.5 text-gray-400 text-xs whitespace-pre">{body}</pre>}
      </div>
    </div>
  )
}

// ─── ResponsePanel ────────────────────────────────────────────────────────────

export function ResponsePanel({ data, error }: { data: unknown; error: string | null }) {
  if (error) return <div className="rounded-xl bg-red-950 border border-red-800 p-4 text-xs font-mono text-red-300">{error}</div>
  if (data === null) return null

  const json = JSON.stringify(data, null, 2)

  function highlight(text: string) {
    return text.split('\n').map((line, i) => {
      const m = line.match(/^(\s*)"([^"]+)"(\s*:\s*)(.*)$/)
      if (m) {
        const [, indent, key, colon, rest] = m
        const vs = rest.startsWith('"') ? 'text-green-300'
          : rest === 'true' || rest === 'false' ? 'text-yellow-300'
          : rest.match(/^-?\d/) ? 'text-yellow-300'
          : 'text-gray-300'
        return (
          <div key={i}>
            {indent}<span className="text-sky-300">"{key}"</span>
            <span className="text-gray-500">{colon}</span>
            <span className={vs}>{rest}</span>
          </div>
        )
      }
      return <div key={i} className="text-gray-400">{line}</div>
    })
  }

  return (
    <div className="rounded-xl bg-gray-950 border border-gray-800 overflow-hidden">
      <div className="bg-gray-900 px-4 py-2 flex items-center gap-2 border-b border-gray-800">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs text-gray-500 font-mono">Response</span>
      </div>
      <pre className="px-4 py-3 text-xs font-mono leading-relaxed overflow-x-auto max-h-64">{highlight(json)}</pre>
    </div>
  )
}

// ─── Shell ────────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLE = {
  Beginner:     'bg-green-50 text-green-700 border-green-200',
  Intermediate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Advanced:     'bg-red-50 text-red-700 border-red-200',
}

const TYPE_LABEL: Record<StepDef['type'], string> = {
  observe: 'Observe',
  action:  'Break',
  fix:     'Fix',
  setup:   'Setup',
}
const TYPE_STYLE: Record<StepDef['type'], string> = {
  observe: 'bg-sky-100 text-sky-700',
  action:  'bg-red-100 text-rausch',
  fix:     'bg-green-100 text-green-700',
  setup:   'bg-purple-100 text-purple-700',
}

const INSIGHT_STYLE = {
  info:    'bg-sky-50 border-sky-200 text-sky-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  success: 'bg-green-50 border-green-200 text-green-800',
}
const INSIGHT_ICON = { info: 'ℹ', warning: '⚠', success: '✓' }

export default function LabShell({ config }: { config: LabConfig }) {
  const { steps } = config
  const [stepStates, setStepStates] = useState<StepState[]>(
    steps.map((_, i) => ({ status: i === 0 ? 'active' : 'pending', response: null, loading: false, error: null }))
  )
  const [finished, setFinished] = useState(false)

  const completedCount = stepStates.filter(s => s.status === 'done').length

  function update(i: number, patch: Partial<StepState>) {
    setStepStates(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s))
  }

  async function execute(stepIdx: number) {
    const step = steps[stepIdx]
    if (!step.apiPath || !step.apiMethod) return
    update(stepIdx, { loading: true, error: null })
    try {
      const opts: RequestInit = { method: step.apiMethod }
      if (step.apiBody) {
        opts.headers = { 'Content-Type': 'application/json' }
        opts.body = JSON.stringify(step.apiBody)
      }
      const res = await fetch(step.apiPath, opts)
      const data = await res.json()
      update(stepIdx, { loading: false, response: data })
      step.onResponse?.(data)
    } catch (e) {
      update(stepIdx, { loading: false, error: e instanceof Error ? e.message : 'Request failed' })
    }
  }

  function advance(stepIdx: number) {
    if (stepIdx === steps.length - 1) {
      update(stepIdx, { status: 'done' })
      setFinished(true)
      return
    }
    setStepStates(prev => prev.map((s, i) => {
      if (i === stepIdx) return { ...s, status: 'done' }
      if (i === stepIdx + 1) return { ...s, status: 'active' }
      return s
    }))
    setTimeout(() => {
      document.getElementById(`step-${stepIdx + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function reset() {
    setStepStates(steps.map((_, i) => ({ status: i === 0 ? 'active' : 'pending', response: null, loading: false, error: null })))
    setFinished(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-air-bg text-hof">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/labs')} className="text-foggy hover:text-rausch transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div>
            <span className="text-xs text-foggy">Lab {config.number}</span>
            <h1 className="text-sm font-bold text-hof leading-tight">{config.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!finished && (
            <span className="text-xs text-foggy">Step {Math.min(completedCount + 1, steps.length)} of {steps.length}</span>
          )}
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${
                stepStates[i].status === 'done' ? 'bg-balearic w-4'
                : stepStates[i].status === 'active' ? 'bg-rausch w-4'
                : 'bg-gray-200 w-1.5'
              }`} />
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Intro card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-hof">{config.title}</h2>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${DIFFICULTY_STYLE[config.difficulty]}`}>
                  {config.difficulty}
                </span>
              </div>
              <p className="text-sm text-foggy leading-relaxed mb-2">{config.description}</p>
              <span className="text-xs text-foggy">{config.duration} · {steps.length} steps</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => {
            const state = stepStates[i]
            const hasApi = !!step.apiPath
            const hasResponse = state.response !== null || state.error !== null

            return (
              <div
                key={step.id}
                id={`step-${i}`}
                className={`scroll-mt-24 rounded-2xl border transition-all ${
                  state.status === 'active' ? 'border-rausch bg-white shadow-sm'
                  : state.status === 'done' ? 'border-gray-200 bg-white opacity-75'
                  : 'border-gray-200 bg-gray-50 opacity-40'
                }`}
              >
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    state.status === 'done' ? 'bg-balearic text-white'
                    : state.status === 'active' ? 'bg-rausch text-white'
                    : 'bg-gray-200 text-foggy'
                  }`}>
                    {state.status === 'done' ? '✓' : step.id}
                  </div>
                  <h3 className="font-semibold text-hof text-sm flex-1">{step.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_STYLE[step.type]}`}>
                    {TYPE_LABEL[step.type]}
                  </span>
                </div>

                {state.status !== 'pending' && (
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <p className="text-sm text-hof leading-relaxed">{step.what}</p>
                        <div className="text-xs text-foggy bg-gray-50 rounded-xl p-3 border border-gray-100 leading-relaxed">
                          <span className="font-semibold text-hof block mb-1">Why this matters</span>
                          {step.why}
                        </div>
                        {step.devMethod && step.devPath && (
                          <DevCmd method={step.devMethod} path={step.devPath} body={step.devBody} />
                        )}
                      </div>
                      <div className="space-y-3">
                        {step.visual}
                        {!step.visual && !hasResponse && hasApi && (
                          <div className="flex items-center justify-center h-40 rounded-xl border-2 border-dashed border-gray-200 text-foggy text-sm">
                            Run the command to see the response
                          </div>
                        )}
                        {hasResponse && <ResponsePanel data={state.response} error={state.error} />}
                      </div>
                    </div>

                    <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-xs leading-relaxed ${INSIGHT_STYLE[step.insightType]}`}>
                      <span className="font-bold shrink-0 mt-0.5">{INSIGHT_ICON[step.insightType]}</span>
                      <span>{step.insight}</span>
                    </div>

                    {state.status === 'active' && (
                      <div className="flex items-center gap-3 flex-wrap">
                        {hasApi && (
                          <button
                            onClick={() => execute(i)}
                            disabled={state.loading}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
                              step.type === 'action' ? 'bg-rausch text-white hover:bg-red-500'
                              : step.type === 'fix' ? 'bg-balearic text-white hover:bg-teal-600'
                              : 'bg-hof text-white hover:bg-gray-700'
                            }`}
                          >
                            {state.loading ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Running…
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {step.type === 'action' ? 'Execute (breaks cluster)' : step.type === 'fix' ? 'Execute (fix)' : 'Execute'}
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => advance(i)}
                          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                            hasResponse || !hasApi
                              ? 'bg-air-bg border border-gray-200 hover:border-hof text-hof'
                              : 'border border-dashed border-gray-300 text-foggy hover:border-gray-400 hover:text-hof'
                          }`}
                          title={!hasResponse && hasApi ? 'Ran it in Dashboards? Click to advance.' : undefined}
                        >
                          {i === steps.length - 1 ? 'Complete lab' : 'Next step'}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {!hasResponse && hasApi && (
                          <span className="text-xs text-foggy italic">or run in Dashboards and skip</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {finished && (
          <div className="mt-8 bg-white rounded-2xl border border-balearic p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-balearic/10 text-balearic flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
            <h2 className="text-xl font-bold text-hof mb-2">Lab complete</h2>
            <p className="text-foggy text-sm max-w-md mx-auto mb-6 leading-relaxed">{config.completionText}</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={reset} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:border-hof text-hof transition-colors">
                Repeat lab
              </button>
              <button onClick={() => navigate('/labs')} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-rausch text-white hover:bg-red-500 transition-colors">
                Back to labs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
