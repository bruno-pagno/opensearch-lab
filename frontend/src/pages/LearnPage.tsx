import { useState } from 'react'
import { navigate } from '../utils/navigate'

const SECTIONS = [
  { id: 'cluster',   label: 'Cluster' },
  { id: 'nodes',     label: 'Nodes' },
  { id: 'indices',   label: 'Indices' },
  { id: 'shards',    label: 'Shards' },
  { id: 'replicas',  label: 'Replicas' },
  { id: 'documents', label: 'Documents' },
  { id: 'mapping',   label: 'Mapping' },
]

// ─── DevTools command block ───────────────────────────────────────────────────

interface Cmd { method: string; path: string; body?: string }

function CmdBlock({ commands }: { commands: Cmd[] }) {
  const [copied, setCopied] = useState<number | null>(null)

  function copy(i: number, cmd: Cmd) {
    const text = cmd.body
      ? `${cmd.method} ${cmd.path}\n${cmd.body}`
      : `${cmd.method} ${cmd.path}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  const methodColor: Record<string, string> = {
    GET:    'text-emerald-400',
    PUT:    'text-yellow-400',
    POST:   'text-blue-400',
    DELETE: 'text-red-400',
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-800 text-sm font-mono">
      <div className="bg-gray-900 px-4 py-2 flex items-center gap-2 border-b border-gray-800">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-gray-500 uppercase tracking-wide">OpenSearch DevTools</span>
      </div>
      <div className="bg-gray-950 divide-y divide-gray-800/50">
        {commands.map((cmd, i) => (
          <div key={i} className="group relative px-4 py-3">
            <div>
              <span className={`font-bold ${methodColor[cmd.method] ?? 'text-white'}`}>{cmd.method}</span>
              <span className="text-sky-300"> {cmd.path}</span>
            </div>
            {cmd.body && (
              <pre className="mt-1.5 text-gray-400 text-xs leading-relaxed whitespace-pre">{cmd.body}</pre>
            )}
            <button
              onClick={() => copy(i, cmd)}
              className="absolute top-2.5 right-3 opacity-0 group-hover:opacity-100 text-xs text-gray-500 hover:text-gray-300 transition-all"
            >
              {copied === i ? '✓ copied' : 'copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ id, badge, title, subtitle, children }: {
  id: string
  badge: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 py-12 px-6 md:px-12 border-b border-gray-200 last:border-0">
      <div className="max-w-5xl mx-auto">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-balearic mb-3">{badge}</span>
        <h2 className="text-2xl font-bold text-hof mb-1">{title}</h2>
        <p className="text-foggy mb-8 max-w-2xl">{subtitle}</p>
        {children}
      </div>
    </section>
  )
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">{children}</div>
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 text-sm text-hof leading-relaxed">{children}</div>
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-foggy min-w-[90px]">{label}</span>
      <span className="text-hof font-medium">{value}</span>
    </div>
  )
}

// ─── Cluster visual ───────────────────────────────────────────────────────────

function ClusterVisual() {
  const statuses = [
    { color: 'bg-green-500', label: 'green', desc: 'All primary and replica shards are active.' },
    { color: 'bg-yellow-400', label: 'yellow', desc: 'All primaries active, but some replicas are not.' },
    { color: 'bg-red-500', label: 'red', desc: 'At least one primary shard is not assigned.' },
  ]

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full bg-green-500 shadow shadow-green-200" />
          <span className="text-xs font-bold text-foggy uppercase tracking-wide">Cluster: opensearch-cluster</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['node-1', 'node-2', 'node-3'].map((name, i) => (
            <div key={name} className="rounded-xl border border-gray-200 bg-air-bg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                {i === 0 && (
                  <svg className="w-3 h-3 text-ariel shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
                <span className="text-xs font-semibold text-hof truncate">{name}</span>
              </div>
              <div className="space-y-1">
                <div className="flex gap-1 flex-wrap">
                  {i === 0
                    ? ['master', 'data'].map(r => <span key={r} className="text-[10px] bg-ariel/10 text-ariel px-1.5 py-0.5 rounded-full font-medium">{r}</span>)
                    : ['data'].map(r => <span key={r} className="text-[10px] bg-balearic/10 text-balearic px-1.5 py-0.5 rounded-full font-medium">{r}</span>)
                  }
                </div>
                <div className="text-[10px] text-foggy">heap 45% · disk 30%</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-foggy pt-3 border-t border-gray-100">
          <span>3 nodes</span>
          <span>6 shards</span>
          <span>3 primary · 3 replica</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-foggy uppercase tracking-wide">Health states</p>
        {statuses.map(s => (
          <div key={s.label} className="flex items-center gap-3 text-sm">
            <span className={`w-3 h-3 rounded-full shrink-0 ${s.color}`} />
            <span className="font-semibold w-14 text-hof">{s.label}</span>
            <span className="text-foggy">{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Node visual ──────────────────────────────────────────────────────────────

function NodeVisual() {
  const roles = [
    {
      name: 'Master-eligible',
      badge: 'bg-ariel/10 text-ariel',
      icon: (
        <svg className="w-5 h-5 text-ariel" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      desc: 'Eligible to become the elected master. Controls cluster-wide state: which nodes are part of the cluster and which shards are assigned where.',
    },
    {
      name: 'Data',
      badge: 'bg-balearic/10 text-balearic',
      icon: (
        <svg className="w-5 h-5 text-balearic" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4-8 4" />
          <ellipse cx="12" cy="7" rx="8" ry="4" strokeWidth={2} />
        </svg>
      ),
      desc: 'Holds shards and executes data-related operations: indexing, searching, aggregations. The workhorse of the cluster.',
    },
    {
      name: 'Ingest',
      badge: 'bg-purple-100 text-purple-600',
      icon: (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      desc: 'Pre-processes documents before indexing via pipelines. Can enrich, transform, or drop fields. Similar to Logstash filters but built in.',
    },
    {
      name: 'Coordinator',
      badge: 'bg-gray-100 text-foggy',
      icon: (
        <svg className="w-5 h-5 text-foggy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      desc: 'Routes requests, merges partial results from data nodes, and returns the final response. Holds no data itself.',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {roles.map(r => (
        <div key={r.name} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            {r.icon}
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.badge}`}>{r.name}</span>
          </div>
          <p className="text-xs text-foggy leading-relaxed">{r.desc}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Index visual ─────────────────────────────────────────────────────────────

function IndexVisual() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
          <svg className="w-4 h-4 text-balearic" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span className="text-sm font-semibold text-hof">airbnb-listings</span>
          <span className="ml-auto text-xs text-foggy">index</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[['3', 'primary shards'], ['1', 'replica per shard'], ['15', 'documents']].map(([v, l]) => (
              <div key={l} className="bg-air-bg rounded-lg py-2">
                <p className="text-lg font-bold text-hof">{v}</p>
                <p className="text-[10px] text-foggy">{l}</p>
              </div>
            ))}
          </div>
          <div className="text-xs space-y-1 pt-1 border-t border-gray-100">
            <div className="flex justify-between text-foggy">
              <span>health</span><span className="text-green-600 font-semibold">green</span>
            </div>
            <div className="flex justify-between text-foggy">
              <span>status</span><span className="text-hof font-medium">open</span>
            </div>
            <div className="flex justify-between text-foggy">
              <span>store size</span><span className="text-hof font-medium">~24kb</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-foggy bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 leading-relaxed">
        An index is a logical namespace — not a single file. Internally it's divided into shards, each of which is a self-contained Lucene instance.
      </div>
    </div>
  )
}

// ─── Shard visual ─────────────────────────────────────────────────────────────

function ShardVisual() {
  const nodes = [
    { name: 'node-1', primary: 'P0', replica: 'R1' },
    { name: 'node-2', primary: 'P1', replica: 'R2' },
    { name: 'node-3', primary: 'P2', replica: 'R0' },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4 text-xs text-foggy">
          <span className="font-semibold text-hof">airbnb-listings</span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rausch inline-block" /> primary</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-balearic inline-block" /> replica</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {nodes.map(({ name, primary, replica }) => (
            <div key={name} className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5 text-center">
                <span className="text-xs font-semibold text-foggy">{name}</span>
              </div>
              <div className="p-2 space-y-2">
                <div className="bg-rausch/10 border border-rausch/30 rounded-lg p-2.5 text-center">
                  <p className="text-sm font-bold text-rausch">{primary}</p>
                  <p className="text-[10px] text-rausch/70">primary</p>
                </div>
                <div className="bg-balearic/10 border border-balearic/30 rounded-lg p-2.5 text-center">
                  <p className="text-sm font-bold text-balearic">{replica}</p>
                  <p className="text-[10px] text-balearic/70">replica</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-[10px] text-foggy">
          <span>R0 mirrors P0 on node-1</span>
          <span>R1 mirrors P1 on node-2</span>
          <span>R2 mirrors P2 on node-3</span>
        </div>
        <p className="text-[10px] text-center text-foggy mt-1 italic">Each replica lives on a different node than its primary.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-foggy uppercase tracking-wide mb-3">Document routing</p>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="bg-gray-100 rounded-lg px-3 py-1.5 font-mono text-hof text-xs">doc._id</span>
          <svg className="w-4 h-4 text-foggy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="bg-gray-100 rounded-lg px-3 py-1.5 font-mono text-hof text-xs">hash(_id) % num_primary_shards</span>
          <svg className="w-4 h-4 text-foggy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="bg-rausch/10 rounded-lg px-3 py-1.5 font-mono text-rausch text-xs font-semibold">shard #</span>
        </div>
        <p className="text-xs text-foggy mt-2">This is why you can't change the number of primary shards after index creation — the routing formula is baked in.</p>
      </div>
    </div>
  )
}

// ─── Replica / failover visual ────────────────────────────────────────────────

function ReplicaVisual() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Healthy state */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-700">Healthy — 3 nodes</span>
          </div>
          <div className="p-3 grid grid-cols-3 gap-2">
            {[
              { name: 'node-1', shards: [{ id: 'P0', primary: true }, { id: 'R2', primary: false }], down: false },
              { name: 'node-2', shards: [{ id: 'P1', primary: true }, { id: 'R0', primary: false }], down: false },
              { name: 'node-3', shards: [{ id: 'P2', primary: true }, { id: 'R1', primary: false }], down: false },
            ].map(n => (
              <div key={n.name} className="rounded-lg border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 text-center py-1 text-[10px] font-semibold text-foggy border-b border-gray-100">{n.name}</div>
                <div className="p-1.5 space-y-1">
                  {n.shards.map(s => (
                    <div key={s.id} className={`rounded text-center py-1 text-[11px] font-bold ${s.primary ? 'bg-rausch/10 text-rausch' : 'bg-balearic/10 text-balearic'}`}>{s.id}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* node-2 down state */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-xs font-semibold text-yellow-700">node-2 fails — recovery</span>
          </div>
          <div className="p-3 grid grid-cols-3 gap-2">
            {[
              { name: 'node-1', shards: [{ id: 'P0', primary: true }, { id: 'R2', primary: false }], down: false },
              { name: 'node-2', shards: [], down: true },
              { name: 'node-3', shards: [{ id: 'P2', primary: true }, { id: 'R1', primary: false }, { id: 'P1★', primary: true }], down: false },
            ].map(n => (
              <div key={n.name} className={`rounded-lg border overflow-hidden ${n.down ? 'border-red-200 opacity-50' : 'border-gray-100'}`}>
                <div className={`text-center py-1 text-[10px] font-semibold border-b ${n.down ? 'bg-red-50 text-red-500 border-red-200' : 'bg-gray-50 text-foggy border-gray-100'}`}>{n.down ? '✕ ' : ''}{n.name}</div>
                <div className="p-1.5 space-y-1">
                  {n.shards.map(s => (
                    <div key={s.id} className={`rounded text-center py-1 text-[10px] font-bold leading-tight ${s.primary ? 'bg-rausch/10 text-rausch' : 'bg-balearic/10 text-balearic'}`}>{s.id}</div>
                  ))}
                  {n.down && <div className="text-center text-[10px] text-red-400 py-2">offline</div>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-foggy text-center pb-2">R0 on node-1 promoted to P1 automatically</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
        A single-node cluster with <span className="font-semibold">1 replica</span> will always show <span className="font-semibold text-yellow-600">yellow</span> — the replica can't be assigned because it can't live on the same node as its primary.
      </div>
    </div>
  )
}

// ─── Document visual ──────────────────────────────────────────────────────────

function DocumentVisual() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gray-950 overflow-hidden border border-gray-800">
        <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">airbnb-listings / _doc / abc123</span>
          <span className="text-xs text-gray-600">document</span>
        </div>
        <pre className="px-4 py-3 text-xs font-mono leading-relaxed overflow-x-auto">
<span className="text-gray-500">{'{'}</span>
  <span className="text-sky-300">"_index"</span><span className="text-gray-400">: </span><span className="text-green-300">"airbnb-listings"</span><span className="text-gray-500">,</span>
  <span className="text-sky-300">"_id"</span><span className="text-gray-400">: </span><span className="text-green-300">"abc123"</span><span className="text-gray-500">,</span>
  <span className="text-sky-300">"_source"</span><span className="text-gray-400">: </span><span className="text-gray-500">{'{'}</span>
    <span className="text-sky-300">"title"</span><span className="text-gray-400">: </span><span className="text-green-300">"Cozy Studio in the Mission District"</span><span className="text-gray-500">,</span>
    <span className="text-sky-300">"city"</span><span className="text-gray-400">: </span><span className="text-green-300">"San Francisco"</span><span className="text-gray-500">,</span>
    <span className="text-sky-300">"price_per_night"</span><span className="text-gray-400">: </span><span className="text-yellow-300">120.0</span><span className="text-gray-500">,</span>
    <span className="text-sky-300">"rating"</span><span className="text-gray-400">: </span><span className="text-yellow-300">4.9</span><span className="text-gray-500">,</span>
    <span className="text-sky-300">"amenities"</span><span className="text-gray-400">: </span><span className="text-gray-500">[</span><span className="text-green-300">"WiFi"</span><span className="text-gray-500">, </span><span className="text-green-300">"Kitchen"</span><span className="text-gray-500">]</span>
  <span className="text-gray-500">{'}'}</span>
<span className="text-gray-500">{'}'}</span>
        </pre>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-foggy uppercase tracking-wide mb-3">Document lifecycle</p>
        <div className="flex items-center gap-1 text-xs flex-wrap">
          {[
            { label: 'POST /{index}/_doc', color: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: '→ route to shard', color: 'bg-gray-50 border-gray-200 text-foggy' },
            { label: '→ write primary', color: 'bg-rausch/5 border-rausch/20 text-rausch' },
            { label: '→ replicate to replicas', color: 'bg-balearic/5 border-balearic/20 text-balearic' },
            { label: '→ 201 Created', color: 'bg-green-50 border-green-200 text-green-700' },
          ].map(s => (
            <span key={s.label} className={`px-2 py-1 rounded-lg border font-mono ${s.color}`}>{s.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Mapping visual ───────────────────────────────────────────────────────────

function MappingVisual() {
  const fields = [
    { name: 'title',           type: 'text',     indexed: true,  desc: 'Full-text analyzed. Supports fuzzy, phrase, and relevance queries.' },
    { name: 'city',            type: 'keyword',  indexed: true,  desc: 'Exact match only. Used for filtering, aggregations, and sorting.' },
    { name: 'price_per_night', type: 'float',    indexed: true,  desc: 'Numeric. Supports range queries and aggregations (min, max, avg).' },
    { name: 'rating',          type: 'float',    indexed: true,  desc: 'Numeric. Can be used for sorting results by top-rated.' },
    { name: 'amenities',       type: 'keyword',  indexed: true,  desc: 'Array of exact terms. Supports terms aggregation.' },
    { name: 'description',     type: 'text',     indexed: true,  desc: 'Full-text. Analyzed at index time using the standard analyzer.' },
  ]

  const typeColor: Record<string, string> = {
    text:    'bg-purple-50 text-purple-600 border-purple-200',
    keyword: 'bg-blue-50 text-blue-600 border-blue-200',
    float:   'bg-yellow-50 text-yellow-700 border-yellow-200',
    integer: 'bg-orange-50 text-orange-600 border-orange-200',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 grid grid-cols-[1fr_auto_2fr] gap-4 text-[10px] font-bold uppercase tracking-widest text-foggy">
        <span>field</span>
        <span>type</span>
        <span>behavior</span>
      </div>
      <div className="divide-y divide-gray-100">
        {fields.map(f => (
          <div key={f.name} className="px-4 py-2.5 grid grid-cols-[1fr_auto_2fr] gap-4 items-center hover:bg-air-bg transition-colors">
            <span className="font-mono text-xs text-hof font-semibold">{f.name}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${typeColor[f.type] ?? 'bg-gray-100 text-foggy border-gray-200'}`}>{f.type}</span>
            <span className="text-xs text-foggy">{f.desc}</span>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 text-[10px] text-foggy">
        <span className="font-semibold text-purple-600">text</span> = analyzed for full-text search &nbsp;·&nbsp;
        <span className="font-semibold text-blue-600">keyword</span> = stored as-is for exact match &nbsp;·&nbsp;
        <span className="font-semibold text-yellow-600">float/integer</span> = numeric for range queries
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const [active, setActive] = useState('cluster')

  function scrollTo(id: string) {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-air-bg text-hof">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2z" fill="#FF5A5F" />
            <path d="M14 8c-1.1 0-2 .9-2 2v.5C10.3 11.2 9 12.9 9 15c0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.1-1.3-3.8-3-4.5V10c0-1.1-.9-2-2-2zm0 2.5c.8 0 1.5.7 1.5 1.5S14.8 13.5 14 13.5 12.5 12.8 12.5 12s.7-1.5 1.5-1.5zm0 9c-1.9 0-3.5-1.6-3.5-3.5 0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5c0 1.9-1.6 3.5-3.5 3.5z" fill="white" />
          </svg>
          <div>
            <h1 className="text-base font-semibold leading-tight text-hof">OpenSearch Concepts</h1>
            <p className="text-xs text-foggy leading-tight">Airbnb Infrastructure Lab</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/labs" onClick={e => { e.preventDefault(); navigate('/labs') }} className="text-sm text-foggy hover:text-rausch font-medium transition-colors">Labs</a>
          <a href="/admin" onClick={e => { e.preventDefault(); navigate('/admin') }} className="text-sm text-foggy hover:text-rausch font-medium transition-colors">Admin</a>
          <a href="/" onClick={e => { e.preventDefault(); navigate('/') }} className="text-sm text-foggy hover:text-rausch font-medium transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to search
          </a>
        </div>
      </header>

      {/* Sticky section nav */}
      <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 overflow-x-auto">
        <ul className="flex min-w-max">
          {SECTIONS.map(s => (
            <li key={s.id}>
              <button
                onClick={() => scrollTo(s.id)}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  active === s.id
                    ? 'text-rausch border-rausch'
                    : 'text-foggy border-transparent hover:text-hof'
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Labs callout */}
      <div className="bg-rausch/5 border-b border-rausch/20 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <p className="text-sm text-hof">
            Ready to apply these concepts? The <span className="font-semibold">Labs</span> section lets you simulate real incidents and recover from them hands-on.
          </p>
          <button
            onClick={() => navigate('/labs')}
            className="shrink-0 text-sm font-semibold text-rausch hover:underline flex items-center gap-1"
          >
            Go to Labs
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <main>
        {/* ── Cluster ── */}
        <Section
          id="cluster"
          badge="01 · Cluster"
          title="The Cluster"
          subtitle="A cluster is a collection of one or more nodes that together hold all your data. Every cluster has a name (default: opensearch) and an elected master node that manages cluster-wide state."
        >
          <Grid2>
            <ClusterVisual />
            <div className="space-y-6">
              <Prose>
                <p>The cluster maintains a shared state called the <strong>cluster state</strong>: which nodes are alive, which indices exist, and where each shard lives. Only the master node can update it, but every node holds a copy.</p>
                <div className="space-y-1.5 pt-1">
                  <Fact label="Name" value="Set at startup. All nodes with the same name join the same cluster." />
                  <Fact label="Master" value="Elected via quorum. Manages shard allocation and index creation." />
                  <Fact label="Health" value="Rolls up from every shard: worst state wins." />
                </div>
              </Prose>
              <CmdBlock commands={[
                { method: 'GET', path: '/_cluster/health' },
                { method: 'GET', path: '/_cluster/health?level=indices' },
                { method: 'GET', path: '/_cluster/stats' },
                { method: 'GET', path: '/_cluster/settings?include_defaults=true' },
              ]} />
            </div>
          </Grid2>
        </Section>

        {/* ── Nodes ── */}
        <Section
          id="nodes"
          badge="02 · Nodes"
          title="Nodes"
          subtitle="A node is a single running instance of OpenSearch. Each node belongs to exactly one cluster and can hold one or more roles. Roles determine what the node does."
        >
          <Grid2>
            <NodeVisual />
            <div className="space-y-6">
              <Prose>
                <p>In a small cluster, one node often holds all roles. In production, roles are separated so that master-eligible nodes aren't affected by heavy indexing or search load on data nodes.</p>
                <div className="space-y-1.5 pt-1">
                  <Fact label="Master" value="One is elected per cluster. Stateless for data — pure control." />
                  <Fact label="Data" value="Stores shards. CPU + heap intensive for search." />
                  <Fact label="Ingest" value="Runs pipelines (field extraction, enrichment)." />
                  <Fact label="Coord." value="Smart load-balancer. No shards, no state." />
                </div>
              </Prose>
              <CmdBlock commands={[
                { method: 'GET', path: '/_nodes' },
                { method: 'GET', path: '/_nodes/stats/jvm,fs,os' },
                { method: 'GET', path: '/_cat/nodes?v&h=name,heap.percent,ram.percent,cpu,master,node.role' },
                { method: 'GET', path: '/_cat/master?v' },
              ]} />
            </div>
          </Grid2>
        </Section>

        {/* ── Indices ── */}
        <Section
          id="indices"
          badge="03 · Indices"
          title="Indices"
          subtitle='An index is a named container for documents with the same structure. Think of it as a database table, but distributed and schema-flexible. The name "indices" is the plural of "index".'
        >
          <Grid2>
            <IndexVisual />
            <div className="space-y-6">
              <Prose>
                <p>When you create an index you set its number of <strong>primary shards</strong> (fixed forever) and <strong>replicas</strong> (can change live). The index also gets a <strong>mapping</strong> that defines field types.</p>
                <div className="space-y-1.5 pt-1">
                  <Fact label="Shards" value="Set at creation. Cannot be changed without reindex." />
                  <Fact label="Replicas" value="Can be increased or decreased at any time." />
                  <Fact label="Open/Closed" value="Closed indices use no heap but reject reads and writes." />
                  <Fact label="Aliases" value="Named pointers to one or more indices. Zero-downtime swaps." />
                </div>
              </Prose>
              <CmdBlock commands={[
                { method: 'GET', path: '/_cat/indices?v&s=index' },
                { method: 'GET', path: '/airbnb-listings' },
                { method: 'GET', path: '/airbnb-listings/_settings' },
                { method: 'PUT', path: '/my-new-index', body: `{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}` },
              ]} />
            </div>
          </Grid2>
        </Section>

        {/* ── Shards ── */}
        <Section
          id="shards"
          badge="04 · Shards"
          title="Shards"
          subtitle="A shard is a single Lucene index — the actual unit of storage and search. Primary shards receive writes. OpenSearch decides which shard a document lands on using a hash of its _id."
        >
          <Grid2>
            <ShardVisual />
            <div className="space-y-6">
              <Prose>
                <p>Shards are what enable horizontal scaling. A search fan-out hits every relevant shard in parallel, then the coordinating node merges the results. More shards = more parallelism, but also more overhead.</p>
                <div className="space-y-1.5 pt-1">
                  <Fact label="Routing" value="hash(_id) % num_primary_shards — deterministic." />
                  <Fact label="Over-shard" value="Too many shards waste heap on segment metadata." />
                  <Fact label="Under-shard" value="Too few shards cap your throughput ceiling." />
                  <Fact label="Rule of thumb" value="Aim for 10–50 GB per shard in production." />
                </div>
              </Prose>
              <CmdBlock commands={[
                { method: 'GET', path: '/_cat/shards?v' },
                { method: 'GET', path: '/_cat/shards/airbnb-listings?v' },
                { method: 'GET', path: '/_cluster/allocation/explain' },
                { method: 'GET', path: '/_cat/shards?v&h=index,shard,prirep,state,node,store' },
              ]} />
            </div>
          </Grid2>
        </Section>

        {/* ── Replicas ── */}
        <Section
          id="replicas"
          badge="05 · Replicas"
          title="Replicas"
          subtitle="A replica shard is an exact copy of a primary shard. Replicas serve two purposes: fault tolerance (if a node dies, the replica is promoted) and read throughput (searches can hit replicas in parallel)."
        >
          <Grid2>
            <ReplicaVisual />
            <div className="space-y-6">
              <Prose>
                <p>OpenSearch never places a replica on the same node as its primary. If you have 1 node and 1 replica, the replica stays <span className="font-semibold text-yellow-600">UNASSIGNED</span> and the cluster stays yellow — by design.</p>
                <div className="space-y-1.5 pt-1">
                  <Fact label="Promotion" value="Automatic when primary's node goes offline." />
                  <Fact label="Read" value="Searches hit primaries and replicas equally." />
                  <Fact label="Write" value="Always goes to primary first, then replicated." />
                  <Fact label="Zero replicas" value="Valid for dev/batch. Lose a node → lose data." />
                </div>
              </Prose>
              <CmdBlock commands={[
                { method: 'GET', path: '/_cat/shards?v&h=index,shard,prirep,state,node' },
                { method: 'PUT', path: '/airbnb-listings/_settings', body: `{
  "index": {
    "number_of_replicas": 0
  }
}` },
                { method: 'GET', path: '/_cluster/allocation/explain', body: `{
  "index": "airbnb-listings",
  "shard": 0,
  "primary": false
}` },
              ]} />
            </div>
          </Grid2>
        </Section>

        {/* ── Documents ── */}
        <Section
          id="documents"
          badge="06 · Documents"
          title="Documents"
          subtitle="A document is a JSON object stored in an index. It's the basic unit of data in OpenSearch, equivalent to a row in a relational database — but schema-flexible and stored in a format optimized for full-text search."
        >
          <Grid2>
            <DocumentVisual />
            <div className="space-y-6">
              <Prose>
                <p>Every document gets a unique <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">_id</code>. If you don't provide one, OpenSearch generates a UUID. The <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">_source</code> field stores the original JSON. Internally, Lucene stores each field in an inverted index for fast search.</p>
                <div className="space-y-1.5 pt-1">
                  <Fact label="_id" value="Determines which shard the doc lives on." />
                  <Fact label="_source" value="Original JSON stored as-is. Can be disabled." />
                  <Fact label="Versioning" value="Every write increments _version." />
                  <Fact label="Refresh" value="Writes are not immediately searchable. Default refresh: 1s." />
                </div>
              </Prose>
              <CmdBlock commands={[
                { method: 'GET', path: '/airbnb-listings/_count' },
                { method: 'GET', path: '/airbnb-listings/_search?size=1' },
                { method: 'POST', path: '/airbnb-listings/_search', body: `{
  "query": { "match_all": {} },
  "size": 1,
  "_source": ["title", "city", "rating"]
}` },
                { method: 'GET', path: '/airbnb-listings/_doc/<id>' },
              ]} />
            </div>
          </Grid2>
        </Section>

        {/* ── Mapping ── */}
        <Section
          id="mapping"
          badge="07 · Mapping"
          title="Mapping"
          subtitle="Mapping is the schema definition for an index — it tells OpenSearch what type each field is and how to index it. The type determines what queries are possible and how the data is stored internally."
        >
          <div className="space-y-8">
            <MappingVisual />
            <Grid2>
              <Prose>
                <p><strong>Dynamic mapping</strong> means OpenSearch infers types automatically from the first document it sees. This is convenient but can surprise you: a field seen first as a number gets mapped as <code className="text-xs bg-gray-100 px-1 rounded">long</code>, and later sending a string for that field fails.</p>
                <p><strong>Explicit mapping</strong> is production best practice. Define your fields upfront. Once a field is mapped, its type cannot be changed — you must reindex into a new index with the corrected mapping.</p>
                <div className="space-y-1.5 pt-1">
                  <Fact label="text" value="Tokenized. Supports full-text and fuzzy search." />
                  <Fact label="keyword" value="Exact match. Used for filters and aggregations." />
                  <Fact label="numeric" value="Ranges, sorting, aggregations." />
                  <Fact label="date" value="Stored as epoch ms. Supports date math." />
                </div>
              </Prose>
              <CmdBlock commands={[
                { method: 'GET', path: '/airbnb-listings/_mapping' },
                { method: 'GET', path: '/airbnb-listings/_field_caps?fields=*' },
                { method: 'PUT', path: '/airbnb-listings/_mapping', body: `{
  "properties": {
    "neighborhood": {
      "type": "keyword"
    }
  }
}` },
                { method: 'POST', path: '/airbnb-listings/_analyze', body: `{
  "analyzer": "standard",
  "text": "Cozy Studio in the Mission"
}` },
              ]} />
            </Grid2>
          </div>
        </Section>
      </main>
    </div>
  )
}
