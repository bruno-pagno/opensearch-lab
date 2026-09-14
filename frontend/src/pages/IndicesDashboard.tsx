import { useCallback, useEffect, useState } from 'react'

interface IndexSummary {
  name: string
  health: 'green' | 'yellow' | 'red' | 'unknown'
  status: string
  docsCount: number
  storeSize: string
  primaryShards: number
  replicaShards: number
}

interface MappingProperty {
  type?: string
  properties?: Record<string, MappingProperty>
}

interface Mapping {
  properties?: Record<string, MappingProperty>
}

const HEALTH_DOT: Record<string, string> = {
  green:   'bg-balearic',
  yellow:  'bg-ariel',
  red:     'bg-rausch',
  unknown: 'bg-gray-400',
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold text-foggy uppercase tracking-widest mb-3">{children}</h2>
}

function ErrorBox({ message }: { message: string }) {
  return <div className="text-rausch text-sm bg-red-50 border border-red-200 rounded-xl p-4">{message}</div>
}

function MappingTree({ properties, depth = 0 }: { properties: Record<string, MappingProperty>; depth?: number }) {
  return (
    <div className={depth > 0 ? 'ml-4 border-l border-gray-100 pl-3' : ''}>
      {Object.entries(properties).map(([field, def]) => (
        <div key={field} className="py-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-hof font-medium">{field}</span>
            {def.type && (
              <span className="text-xs font-medium bg-red-50 text-rausch border border-red-200 px-1.5 py-0.5 rounded-full">
                {def.type}
              </span>
            )}
            {def.properties && !def.type && (
              <span className="text-xs text-foggy italic">object</span>
            )}
          </div>
          {def.properties && <MappingTree properties={def.properties} depth={depth + 1} />}
        </div>
      ))}
    </div>
  )
}

export default function IndicesDashboard() {
  const [indices, setIndices] = useState<IndexSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createShards, setCreateShards] = useState(1)
  const [createReplicas, setCreateReplicas] = useState(0)
  const [creating, setCreating] = useState(false)

  const [expandedMapping, setExpandedMapping] = useState<string | null>(null)
  const [mappings, setMappings] = useState<Record<string, Mapping>>({})
  const [mappingLoading, setMappingLoading] = useState<string | null>(null)

  const [seeding, setSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState<string | null>(null)

  const fetchIndices = useCallback(async () => {
    try {
      const res = await fetch('/api/indices')
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setIndices(await res.json())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchIndices() }, [fetchIndices])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/indices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName, shards: createShards, replicas: createReplicas }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? res.statusText)
      }
      setCreateName('')
      setCreateShards(1)
      setCreateReplicas(0)
      setShowCreate(false)
      await fetchIndices()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete index "${name}"?`)) return
    try {
      const res = await fetch(`/api/indices/${name}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(res.statusText)
      if (expandedMapping === name) setExpandedMapping(null)
      await fetchIndices()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  async function handleToggleMapping(name: string) {
    if (expandedMapping === name) {
      setExpandedMapping(null)
      return
    }
    setExpandedMapping(name)
    if (mappings[name]) return
    setMappingLoading(name)
    try {
      const res = await fetch(`/api/indices/${name}/mapping`)
      if (!res.ok) throw new Error(res.statusText)
      const data = await res.json()
      setMappings(prev => ({ ...prev, [name]: data }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load mapping')
    } finally {
      setMappingLoading(null)
    }
  }

  async function handleSeed() {
    setSeeding(true)
    setSeedMessage(null)
    try {
      const res = await fetch('/api/indices/seed/listings', { method: 'POST' })
      if (!res.ok) throw new Error(res.statusText)
      setSeedMessage('airbnb-listings seeded')
      await fetchIndices()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeading>Indices</SectionHeading>
        <div className="flex items-center gap-2">
          {seedMessage && <span className="text-xs text-balearic font-medium">{seedMessage}</span>}
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-foggy hover:text-hof hover:border-gray-300 disabled:opacity-50 transition-colors"
          >
            {seeding ? 'Seeding…' : 'Seed listings'}
          </button>
          <button
            onClick={() => setShowCreate(v => !v)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rausch text-white hover:bg-red-500 transition-colors"
          >
            {showCreate ? 'Cancel' : '+ Create index'}
          </button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <p className="text-sm font-semibold text-hof mb-4">New index</p>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-1">
              <label className="text-xs text-foggy block mb-1">Name</label>
              <input
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                required
                placeholder="my-index"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-rausch font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-foggy block mb-1">Primary shards</label>
              <input
                type="number" min={1} max={10}
                value={createShards}
                onChange={e => setCreateShards(Number(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-rausch"
              />
            </div>
            <div>
              <label className="text-xs text-foggy block mb-1">Replicas</label>
              <input
                type="number" min={0} max={5}
                value={createReplicas}
                onChange={e => setCreateReplicas(Number(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-rausch"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-rausch text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>
      )}

      {error && <ErrorBox message={error} />}

      {loading ? (
        <p className="text-sm text-foggy">Loading...</p>
      ) : indices.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
          <p className="text-foggy text-sm">No indices yet.</p>
          <p className="text-foggy text-xs mt-1">Create one above or seed the Airbnb listings dataset.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-foggy uppercase tracking-wide">Health</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-foggy uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-foggy uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-foggy uppercase tracking-wide">Docs</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-foggy uppercase tracking-wide">Size</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-foggy uppercase tracking-wide">Pri / Rep</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {indices.map(idx => (
                <>
                  <tr key={idx.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${HEALTH_DOT[idx.health]}`} />
                    </td>
                    <td className="px-5 py-3.5 font-mono font-medium text-hof">{idx.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-gray-100 text-foggy px-2 py-0.5 rounded-full border border-gray-200">
                        {idx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-hof">{idx.docsCount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right font-mono text-foggy">{idx.storeSize}</td>
                    <td className="px-5 py-3.5 text-right font-mono text-foggy">{idx.primaryShards} / {idx.replicaShards}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleMapping(idx.name)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                            expandedMapping === idx.name
                              ? 'bg-red-50 text-rausch border-red-200'
                              : 'text-foggy border-gray-200 hover:text-hof hover:border-gray-300'
                          }`}
                        >
                          Mapping
                        </button>
                        <button
                          onClick={() => handleDelete(idx.name)}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 text-foggy hover:text-rausch hover:border-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedMapping === idx.name && (
                    <tr key={`${idx.name}-mapping`} className="bg-gray-50 border-b border-gray-100">
                      <td colSpan={7} className="px-5 py-4">
                        {mappingLoading === idx.name ? (
                          <p className="text-xs text-foggy">Loading mapping…</p>
                        ) : mappings[idx.name]?.properties ? (
                          <div>
                            <p className="text-xs font-semibold text-foggy uppercase tracking-wide mb-2">Field mappings</p>
                            <MappingTree properties={mappings[idx.name].properties!} />
                          </div>
                        ) : (
                          <p className="text-xs text-foggy italic">No explicit mappings defined (dynamic).</p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
