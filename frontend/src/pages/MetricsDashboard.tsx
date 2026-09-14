import { useFetch } from '../hooks/useFetch'

interface ClusterStats {
  totalDocs: number
  storeSizeBytes: number
  totalShards: number
  primaryShards: number
  queryTotal: number
  queryTimeMs: number
  indexTotal: number
  indexTimeMs: number
}

interface NodeMetrics {
  id: string
  name: string
  heapUsedBytes: number
  heapMaxBytes: number
  gcYoungCount: number
  gcYoungTimeMs: number
  gcOldCount: number
  gcOldTimeMs: number
  searchActive: number
  searchQueue: number
  searchRejected: number
  writeActive: number
  writeQueue: number
  writeRejected: number
  parentBreakerPercent: number
  requestBreakerPercent: number
  fielddataBreakerPercent: number
}

interface IndexStats {
  name: string
  docsCount: number
  storeSizeBytes: number
  queryTotal: number
  queryTimeMs: number
  indexTotal: number
  indexTimeMs: number
  refreshTotal: number
  refreshTimeMs: number
  segmentCount: number
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 / 1024 / 1024
  if (gb >= 1) return `${gb.toFixed(1)} GB`
  const mb = bytes / 1024 / 1024
  if (mb >= 1) return `${mb.toFixed(0)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

function formatAvgMs(total: number, count: number): string {
  if (count === 0) return '—'
  return `${(total / count).toFixed(1)} ms`
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold text-foggy uppercase tracking-widest mb-3">{children}</h2>
}

function ErrorBox({ message }: { message: string }) {
  return <div className="text-rausch text-sm bg-red-50 border border-red-200 rounded-xl p-4">{message}</div>
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-foggy mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-hof">{value}</p>
    </div>
  )
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

function ThreadPoolBadge({ label, active, queue, rejected }: {
  label: string; active: number; queue: number; rejected: number
}) {
  const hasActivity = active > 0 || queue > 0 || rejected > 0
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-foggy font-medium w-14">{label}</span>
      <span className={`${active > 0 ? 'text-ariel font-semibold' : 'text-gray-400'}`}>
        {active} active
      </span>
      <span className={`${queue > 0 ? 'text-ariel font-semibold' : 'text-gray-400'}`}>
        {queue} queued
      </span>
      <span className={`${rejected > 0 ? 'text-rausch font-semibold' : 'text-gray-400'}`}>
        {rejected} rejected
      </span>
    </div>
  )
}

export default function MetricsDashboard() {
  const clusterStats = useFetch<ClusterStats>('/api/metrics/cluster')
  const nodeMetrics  = useFetch<NodeMetrics[]>('/api/metrics/nodes')
  const indexStats   = useFetch<IndexStats[]>('/api/metrics/indices')

  return (
    <div className="space-y-8">

      {/* Cluster overview */}
      <section>
        <SectionHeading>Cluster overview</SectionHeading>
        {clusterStats.error ? <ErrorBox message={clusterStats.error} /> :
         clusterStats.loading ? <p className="text-sm text-foggy">Loading...</p> :
         clusterStats.data && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <Stat label="Total docs"     value={clusterStats.data.totalDocs.toLocaleString()} />
              <Stat label="Store size"     value={formatBytes(clusterStats.data.storeSizeBytes)} />
              <Stat label="Total shards"   value={clusterStats.data.totalShards} />
              <Stat label="Primary shards" value={clusterStats.data.primaryShards} />
              <Stat label="Queries"        value={clusterStats.data.queryTotal.toLocaleString()} />
              <Stat label="Avg query time" value={formatAvgMs(clusterStats.data.queryTimeMs, clusterStats.data.queryTotal)} />
              <Stat label="Docs indexed"   value={clusterStats.data.indexTotal.toLocaleString()} />
              <Stat label="Avg index time" value={formatAvgMs(clusterStats.data.indexTimeMs, clusterStats.data.indexTotal)} />
            </div>
          </div>
        )}
      </section>

      {/* Node metrics */}
      <section>
        <SectionHeading>Node metrics</SectionHeading>
        {nodeMetrics.error ? <ErrorBox message={nodeMetrics.error} /> :
         nodeMetrics.loading ? <p className="text-sm text-foggy">Loading...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nodeMetrics.data?.map(node => {
              const heapPct = node.heapMaxBytes > 0
                ? (node.heapUsedBytes / node.heapMaxBytes) * 100
                : 0

              return (
                <div key={node.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
                  <p className="font-semibold text-hof">{node.name}</p>

                  {/* Heap */}
                  <div>
                    <div className="flex justify-between text-xs text-foggy">
                      <span>Heap</span>
                      <span className="font-medium text-hof">
                        {heapPct.toFixed(1)}% — {formatBytes(node.heapUsedBytes)} / {formatBytes(node.heapMaxBytes)}
                      </span>
                    </div>
                    <MiniBar
                      value={heapPct}
                      color={heapPct > 85 ? 'bg-rausch' : heapPct > 70 ? 'bg-ariel' : 'bg-balearic'}
                    />
                  </div>

                  {/* GC */}
                  <div>
                    <p className="text-xs font-semibold text-foggy uppercase tracking-wide mb-1.5">GC</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                        <p className="text-foggy mb-0.5">Young gen</p>
                        <p className="font-semibold text-hof">{node.gcYoungCount} collections</p>
                        <p className="text-foggy">{node.gcYoungTimeMs} ms total</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                        <p className="text-foggy mb-0.5">Old gen</p>
                        <p className={`font-semibold ${node.gcOldCount > 0 ? 'text-ariel' : 'text-hof'}`}>
                          {node.gcOldCount} collections
                        </p>
                        <p className="text-foggy">{node.gcOldTimeMs} ms total</p>
                      </div>
                    </div>
                  </div>

                  {/* Thread pools */}
                  <div>
                    <p className="text-xs font-semibold text-foggy uppercase tracking-wide mb-1.5">Thread pools</p>
                    <div className="space-y-1">
                      <ThreadPoolBadge label="Search"
                        active={node.searchActive} queue={node.searchQueue} rejected={node.searchRejected} />
                      <ThreadPoolBadge label="Write"
                        active={node.writeActive} queue={node.writeQueue} rejected={node.writeRejected} />
                    </div>
                  </div>

                  {/* Circuit breakers */}
                  <div>
                    <p className="text-xs font-semibold text-foggy uppercase tracking-wide mb-1.5">Circuit breakers</p>
                    <div className="space-y-2">
                      {([
                        ['Parent',    node.parentBreakerPercent],
                        ['Request',   node.requestBreakerPercent],
                        ['Fielddata', node.fielddataBreakerPercent],
                      ] as [string, number][]).map(([label, pct]) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs text-foggy">
                            <span>{label}</span>
                            <span className={`font-medium ${pct > 80 ? 'text-rausch' : pct > 60 ? 'text-ariel' : 'text-hof'}`}>
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                          <MiniBar
                            value={pct}
                            color={pct > 80 ? 'bg-rausch' : pct > 60 ? 'bg-ariel' : 'bg-gray-300'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Index stats */}
      <section>
        <SectionHeading>Index stats</SectionHeading>
        {indexStats.error ? <ErrorBox message={indexStats.error} /> :
         indexStats.loading ? <p className="text-sm text-foggy">Loading...</p> :
         indexStats.data && indexStats.data.length === 0 ? (
          <p className="text-sm text-foggy">No indices. Seed the listings dataset from the Indices tab.</p>
         ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Index', 'Docs', 'Size', 'Queries', 'Avg query', 'Indexed', 'Avg index', 'Refreshes', 'Segments'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-foggy uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {indexStats.data?.map(idx => (
                  <tr key={idx.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-hof">{idx.name}</td>
                    <td className="px-4 py-3 font-mono text-hof">{idx.docsCount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-foggy">{formatBytes(idx.storeSizeBytes)}</td>
                    <td className="px-4 py-3 font-mono text-hof">{idx.queryTotal.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-foggy">{formatAvgMs(idx.queryTimeMs, idx.queryTotal)}</td>
                    <td className="px-4 py-3 font-mono text-hof">{idx.indexTotal.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-foggy">{formatAvgMs(idx.indexTimeMs, idx.indexTotal)}</td>
                    <td className="px-4 py-3 font-mono text-foggy">{idx.refreshTotal.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-hof">{idx.segmentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  )
}
