import { useState } from 'react'
import { navigate } from '../../utils/navigate'

// ─── Types ────────────────────────────────────────────────────────────────────

type StepStatus = 'pending' | 'active' | 'done'

interface StepState {
  status: StepStatus
  response: unknown | null
  loading: boolean
  error: string | null
}

// ─── Cluster visuals ──────────────────────────────────────────────────────────

function GreenCluster() {
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

function YellowCluster() {
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
          <div className="flex flex-col items-center justify-center gap-1 pt-8">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <div className="flex flex-col items-center justify-center pt-5">
            <div className="rounded-xl border-2 border-dashed border-red-300 bg-red-50 p-3 text-center w-20">
              <p className="text-sm font-bold text-red-400">R0</p>
              <p className="text-[10px] text-red-400 leading-tight">UNAS-<br/>SIGNED</p>
            </div>
            <svg className="w-4 h-4 text-red-300 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[9px] text-red-400 font-bold text-center leading-tight">no eligible<br/>node</p>
          </div>
        </div>
      </div>
      <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-center">
        1 primary assigned · 1 replica <span className="font-bold">UNASSIGNED</span>
      </div>
    </div>
  )
}

// ─── JSON response display ────────────────────────────────────────────────────

function ResponsePanel({ data, error }: { data: unknown; error: string | null }) {
  if (error) {
    return (
      <div className="rounded-xl bg-red-950 border border-red-800 p-4 text-xs font-mono text-red-300">{error}</div>
    )
  }
  if (data === null) return null

  const json = JSON.stringify(data, null, 2)

  function highlight(text: string) {
    return text.split('\n').map((line, i) => {
      const keyMatch = line.match(/^(\s*)"([^"]+)"(\s*:\s*)(.*)$/)
      if (keyMatch) {
        const [, indent, key, colon, rest] = keyMatch
        const valueStyle = rest.startsWith('"') ? 'text-green-300'
          : rest === 'true' || rest === 'false' ? 'text-yellow-300'
          : rest.match(/^-?\d/) ? 'text-yellow-300'
          : 'text-gray-300'
        return (
          <div key={i}>
            {indent}
            <span className="text-sky-300">"{key}"</span>
            <span className="text-gray-500">{colon}</span>
            <span className={valueStyle}>{rest}</span>
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

// ─── DevTools command display ─────────────────────────────────────────────────

function DevCmd({ method, path, body }: { method: string; path: string; body?: string }) {
  const [copied, setCopied] = useState(false)
  const color = { GET: 'text-emerald-400', PUT: 'text-yellow-400', POST: 'text-blue-400' }[method] ?? 'text-white'

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

// ─── Step definition ──────────────────────────────────────────────────────────

interface StepDef {
  id: number
  title: string
  type: 'observe' | 'action' | 'fix'
  visual: 'green' | 'yellow' | 'none'
  what: string
  why: string
  devMethod: string
  devPath: string
  devBody?: string
  apiPath: string
  apiMethod: string
  apiBody?: object
  insight: string
  insightType: 'info' | 'warning' | 'success'
}

const STEPS: StepDef[] = [
  {
    id: 1,
    title: 'Verify the cluster is healthy',
    type: 'observe',
    visual: 'green',
    what: 'Before breaking anything, confirm the cluster starts green. The airbnb-listings index has 0 replicas — all shards are assigned.',
    why: 'Establishing a known-good baseline is the first step of any incident response.',
    devMethod: 'GET', devPath: '/_cluster/health',
    apiMethod: 'GET', apiPath: '/api/cluster/health',
    insight: 'status: "green" means every primary and replica shard is assigned and active.',
    insightType: 'info',
  },
  {
    id: 2,
    title: 'Break it — enable 1 replica',
    type: 'action',
    visual: 'none',
    what: 'Set number_of_replicas to 1 on airbnb-listings. OpenSearch will immediately try to place the new replica shard.',
    why: 'In a single-node cluster, the replica can never be assigned — it cannot co-locate with its own primary. This turns the cluster yellow.',
    devMethod: 'PUT', devPath: '/airbnb-listings/_settings',
    devBody: '{\n  "index": {\n    "number_of_replicas": 1\n  }\n}',
    apiMethod: 'PUT', apiPath: '/api/indices/airbnb-listings/replicas',
    apiBody: { count: 1 },
    insight: 'OpenSearch accepts the settings change immediately and updates cluster state. The replica shard transitions from UNASSIGNED with reason INDEX_CREATED.',
    insightType: 'warning',
  },
  {
    id: 3,
    title: 'Observe the yellow health',
    type: 'observe',
    visual: 'yellow',
    what: 'Check cluster health again. The status is now yellow with 1 unassigned shard.',
    why: '"yellow" means all primary shards are active but at least one replica is not assigned. Data is safe, but the cluster has no redundancy.',
    devMethod: 'GET', devPath: '/_cluster/health',
    apiMethod: 'GET', apiPath: '/api/cluster/health',
    insight: 'unassigned_shards: 1 — this is the replica we just enabled. The primary (P0) is still STARTED and serving reads/writes.',
    insightType: 'warning',
  },
  {
    id: 4,
    title: 'Inspect shard state',
    type: 'observe',
    visual: 'yellow',
    what: 'List the shards for airbnb-listings. You can see exactly which shard is unassigned and what node (if any) it is on.',
    why: 'The shard table is the most direct way to see where each shard lives. prirep=r means replica.',
    devMethod: 'GET', devPath: '/_cat/shards/airbnb-listings?v&h=index,shard,prirep,state,node',
    apiMethod: 'GET', apiPath: '/api/cluster/shards/airbnb-listings',
    insight: 'The primary (prirep=p) shows state=STARTED on node-1. The replica (prirep=r) shows state=UNASSIGNED with no node assigned.',
    insightType: 'warning',
  },
  {
    id: 5,
    title: 'Diagnose with allocation explain',
    type: 'observe',
    visual: 'yellow',
    what: 'This is the key API. It picks the first unassigned shard and explains exactly why it cannot be allocated — node by node.',
    why: 'In production this is always your first tool when a shard is stuck UNASSIGNED. It tells you whether the problem is disk watermark, rack awareness, node attributes, or — as here — simply no eligible node.',
    devMethod: 'GET', devPath: '/_cluster/allocation/explain',
    apiMethod: 'GET', apiPath: '/api/cluster/allocation/explain',
    insight: '"can_allocate": "no" with explanation "the shard cannot be allocated to the same node on which a copy of the shard already exists" — this is the single-node limitation in plain English.',
    insightType: 'warning',
  },
  {
    id: 6,
    title: 'Fix it — set replicas back to 0',
    type: 'fix',
    visual: 'none',
    what: 'Drop the replica count back to 0. OpenSearch will immediately cancel the unassigned shard and the cluster recovers.',
    why: 'On a single-node dev cluster, replicas are always 0. In a multi-node cluster you would add more nodes instead of removing replicas.',
    devMethod: 'PUT', devPath: '/airbnb-listings/_settings',
    devBody: '{\n  "index": {\n    "number_of_replicas": 0\n  }\n}',
    apiMethod: 'PUT', apiPath: '/api/indices/airbnb-listings/replicas',
    apiBody: { count: 0 },
    insight: 'The cluster recovers in milliseconds — no data movement needed, the primary was never affected.',
    insightType: 'success',
  },
  {
    id: 7,
    title: 'Verify recovery',
    type: 'observe',
    visual: 'green',
    what: 'Confirm the cluster is green again. Zero unassigned shards.',
    why: 'Always verify after a fix. In production you might also check _cat/shards to confirm specific shards are STARTED.',
    devMethod: 'GET', devPath: '/_cluster/health',
    apiMethod: 'GET', apiPath: '/api/cluster/health',
    insight: 'status: "green" — incident resolved. The allocation explain API will now return "All shards are assigned" if you run it again.',
    insightType: 'success',
  },
]

const INSIGHT_STYLE = {
  info:    'bg-sky-50 border-sky-200 text-sky-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  success: 'bg-green-50 border-green-200 text-green-800',
}

const INSIGHT_ICON = {
  info:    'ℹ',
  warning: '⚠',
  success: '✓',
}

// ─── Lab ──────────────────────────────────────────────────────────────────────

export default function UnassignedReplicasLab() {
  const [stepStates, setStepStates] = useState<StepState[]>(
    STEPS.map((_, i) => ({
      status: i === 0 ? 'active' : 'pending',
      response: null,
      loading: false,
      error: null,
    }))
  )
  const [finished, setFinished] = useState(false)

  const currentStep = stepStates.findIndex(s => s.status === 'active')
  const completedCount = stepStates.filter(s => s.status === 'done').length

  function update(i: number, patch: Partial<StepState>) {
    setStepStates(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s))
  }

  async function execute(stepIdx: number) {
    const step = STEPS[stepIdx]
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
    } catch (e) {
      update(stepIdx, { loading: false, error: e instanceof Error ? e.message : 'Request failed' })
    }
  }

  function advance(stepIdx: number) {
    if (stepIdx === STEPS.length - 1) {
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

  const TYPE_LABEL: Record<StepDef['type'], string> = {
    observe: 'Observe',
    action: 'Break',
    fix: 'Fix',
  }
  const TYPE_STYLE: Record<StepDef['type'], string> = {
    observe: 'bg-sky-100 text-sky-700',
    action: 'bg-red-100 text-rausch',
    fix: 'bg-green-100 text-green-700',
  }

  return (
    <div className="min-h-screen bg-air-bg text-hof">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/labs')} className="text-foggy hover:text-rausch transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div>
            <span className="text-xs text-foggy">Lab 1</span>
            <h1 className="text-sm font-bold text-hof leading-tight">Unassigned Replicas</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!finished && (
            <span className="text-xs text-foggy">
              Step {Math.min(completedCount + 1, STEPS.length)} of {STEPS.length}
            </span>
          )}
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  stepStates[i].status === 'done' ? 'bg-balearic w-4'
                  : stepStates[i].status === 'active' ? 'bg-rausch w-4'
                  : 'bg-gray-200 w-1.5'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Intro */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rausch/10 text-rausch flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-hof mb-1">Unassigned Replicas</h2>
              <p className="text-sm text-foggy leading-relaxed mb-3">
                One of the most common causes of a yellow cluster: a replica shard has nowhere to go. You'll deliberately cause this, read the real OpenSearch API responses as the cluster degrades, then recover it.
              </p>
              <div className="flex gap-3 text-xs">
                <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">Beginner</span>
                <span className="text-foggy">~5 minutes</span>
                <span className="text-foggy">7 steps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((step, i) => {
            const state = stepStates[i]
            const canExecute = state.status !== 'pending'
            const hasResponse = state.response !== null || state.error !== null

            return (
              <div
                key={step.id}
                id={`step-${i}`}
                className={`scroll-mt-24 rounded-2xl border transition-all ${
                  state.status === 'active'
                    ? 'border-rausch bg-white shadow-sm'
                    : state.status === 'done'
                    ? 'border-gray-200 bg-white opacity-75'
                    : 'border-gray-200 bg-gray-50 opacity-40'
                }`}
              >
                {/* Step header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    state.status === 'done' ? 'bg-balearic text-white'
                    : state.status === 'active' ? 'bg-rausch text-white'
                    : 'bg-gray-200 text-foggy'
                  }`}>
                    {state.status === 'done' ? '✓' : step.id}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-hof text-sm">{step.title}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_STYLE[step.type]}`}>
                    {TYPE_LABEL[step.type]}
                  </span>
                </div>

                {/* Step body — only shown when active or done */}
                {state.status !== 'pending' && (
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Left: text */}
                      <div className="space-y-3">
                        <p className="text-sm text-hof leading-relaxed">{step.what}</p>
                        <div className="text-xs text-foggy bg-gray-50 rounded-xl p-3 border border-gray-100 leading-relaxed">
                          <span className="font-semibold text-hof block mb-1">Why this matters</span>
                          {step.why}
                        </div>
                        <DevCmd method={step.devMethod} path={step.devPath} body={step.devBody} />
                      </div>

                      {/* Right: visual or response */}
                      <div className="space-y-3">
                        {step.visual !== 'none' && (
                          step.visual === 'green' ? <GreenCluster /> : <YellowCluster />
                        )}
                        {step.visual === 'none' && !hasResponse && (
                          <div className="flex items-center justify-center h-40 rounded-xl border-2 border-dashed border-gray-200 text-foggy text-sm">
                            Run the command to see the response
                          </div>
                        )}
                        {hasResponse && (
                          <ResponsePanel data={state.response} error={state.error} />
                        )}
                      </div>
                    </div>

                    {/* Insight */}
                    <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-xs leading-relaxed ${INSIGHT_STYLE[step.insightType]}`}>
                      <span className="font-bold shrink-0 mt-0.5">{INSIGHT_ICON[step.insightType]}</span>
                      <span>{step.insight}</span>
                    </div>

                    {/* Actions */}
                    {state.status === 'active' && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => execute(i)}
                          disabled={state.loading}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                            step.type === 'action'
                              ? 'bg-rausch text-white hover:bg-red-500 disabled:opacity-60'
                              : step.type === 'fix'
                              ? 'bg-balearic text-white hover:bg-teal-600 disabled:opacity-60'
                              : 'bg-hof text-white hover:bg-gray-700 disabled:opacity-60'
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
                              {step.type === 'action' ? 'Execute (breaks the cluster)' : step.type === 'fix' ? 'Execute (fixes the cluster)' : 'Execute'}
                            </>
                          )}
                        </button>

                        {hasResponse && !state.loading && (
                          <button
                            onClick={() => advance(i)}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-air-bg border border-gray-200 hover:border-hof text-hof transition-colors"
                          >
                            {i === STEPS.length - 1 ? 'Complete lab' : 'Next step'}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Completion card */}
        {finished && (
          <div className="mt-8 bg-white rounded-2xl border border-balearic p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-balearic/10 text-balearic flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h2 className="text-xl font-bold text-hof mb-2">Lab complete</h2>
            <p className="text-foggy text-sm max-w-md mx-auto mb-6 leading-relaxed">
              You broke a green cluster, used <code className="bg-gray-100 px-1 rounded font-mono">_cluster/allocation/explain</code> to understand exactly why the shard couldn't be placed, and fixed it. This is the real incident workflow.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setStepStates(STEPS.map((_, i) => ({ status: i === 0 ? 'active' : 'pending', response: null, loading: false, error: null })))
                  setFinished(false)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:border-hof text-hof transition-colors"
              >
                Repeat lab
              </button>
              <button
                onClick={() => navigate('/labs')}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-rausch text-white hover:bg-red-500 transition-colors"
              >
                Back to labs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
