import { useFetch } from '../hooks/useFetch'

interface ClusterHealth {
  clusterName: string
  status: 'green' | 'yellow' | 'red'
  numberOfNodes: number
  numberOfDataNodes: number
  activePrimaryShards: number
  activeShards: number
  relocatingShards: number
  initializingShards: number
  unassignedShards: number
}

interface NodeInfo {
  id: string
  name: string
  host: string
  version: string
  roles: string[]
  heapUsedBytes?: number
  heapMaxBytes?: number
  heapPercent?: number
  diskTotalBytes?: number
  diskAvailableBytes?: number
}

interface ClusterSettings {
  persistent: Record<string, unknown>
  transient: Record<string, unknown>
}

// --- banner styles by status ---
const BANNER_BG    = { green: 'bg-white',     yellow: 'bg-amber-50', red: 'bg-red-50'    }
const BANNER_BORDER = { green: 'border-gray-200', yellow: 'border-amber-200', red: 'border-red-200' }
const STATUS_DOT   = { green: 'bg-balearic',  yellow: 'bg-ariel',    red: 'bg-rausch'    }
const STATUS_RING  = { green: 'ring-green-100', yellow: 'ring-amber-100', red: 'ring-red-100' }
const STATUS_TEXT  = { green: 'text-balearic', yellow: 'text-ariel',  red: 'text-rausch'  }

// --- metric severity ---
type Severity = 'error' | 'warn' | 'muted' | 'normal'

function metricSeverity(key: string, value: number): Severity {
  if (key === 'unassigned'    && value > 0) return 'error'
  if (key === 'initializing'  && value > 0) return 'warn'
  if (key === 'relocating'    && value > 0) return 'warn'
  if (['unassigned', 'initializing', 'relocating'].includes(key) && value === 0) return 'muted'
  return 'normal'
}

const SEVERITY_NUM: Record<Severity, string> = {
  error:  'text-rausch',
  warn:   'text-ariel',
  muted:  'text-gray-300',
  normal: 'text-hof',
}

function healthCauses(d: ClusterHealth): string[] {
  const out: string[] = []
  if (d.unassignedShards   > 0) out.push(`${d.unassignedShards} shard${d.unassignedShards   > 1 ? 's' : ''} unassigned`)
  if (d.initializingShards > 0) out.push(`${d.initializingShards} shard${d.initializingShards > 1 ? 's' : ''} initializing`)
  if (d.relocatingShards   > 0) out.push(`${d.relocatingShards} shard${d.relocatingShards   > 1 ? 's' : ''} relocating`)
  return out
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 / 1024 / 1024
  if (gb >= 1) return `${gb.toFixed(1)} GB`
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold text-foggy uppercase tracking-widest mb-3">{children}</h2>
}

function ErrorBox({ message }: { message: string }) {
  return <div className="text-rausch text-sm bg-red-50 border border-red-200 rounded-xl p-4">{message}</div>
}

export default function ClusterDashboard() {
  const health   = useFetch<ClusterHealth>('/api/cluster/health')
  const nodes    = useFetch<NodeInfo[]>('/api/cluster/nodes')
  const settings = useFetch<ClusterSettings>('/api/cluster/settings')

  const status = health.data?.status ?? 'red'
  const causes = health.data ? healthCauses(health.data) : []

  return (
    <div className="space-y-8">

      {/* Health banner */}
      <section>
        {health.error ? <ErrorBox message={health.error} /> :
         health.loading ? <p className="text-sm text-foggy">Loading...</p> :
         health.data && (
          <div className={`rounded-xl border ${BANNER_BG[status]} ${BANNER_BORDER[status]} p-6`}>

            {/* Status row */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className={`w-4 h-4 rounded-full ring-4 ${STATUS_DOT[status]} ${STATUS_RING[status]}`} />
                <div>
                  <span className={`text-2xl font-bold uppercase tracking-wide ${STATUS_TEXT[status]}`}>
                    {status}
                  </span>
                  <span className="text-foggy text-sm ml-3">{health.data.clusterName}</span>
                </div>
              </div>
              {health.lastUpdated && (
                <span className="text-xs text-gray-400 mt-1">Updated {formatTime(health.lastUpdated)}</span>
              )}
            </div>

            {/* Cause messages */}
            {causes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {causes.map(cause => (
                  <span key={cause} className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {cause}
                  </span>
                ))}
              </div>
            )}

            {/* Metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {([
                ['Nodes',          'nodes',        health.data.numberOfNodes],
                ['Data nodes',     'dataNodes',    health.data.numberOfDataNodes],
                ['Active shards',  'active',       health.data.activeShards],
                ['Primary shards', 'primary',      health.data.activePrimaryShards],
                ['Relocating',     'relocating',   health.data.relocatingShards],
                ['Initializing',   'initializing', health.data.initializingShards],
                ['Unassigned',     'unassigned',   health.data.unassignedShards],
              ] as [string, string, number][]).map(([label, key, value]) => {
                const sev = metricSeverity(key, value)
                return (
                  <div key={label}>
                    <p className="text-xs text-foggy mb-0.5">{label}</p>
                    <p className={`text-2xl font-bold ${SEVERITY_NUM[sev]}`}>{value}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* Nodes */}
      <section>
        <SectionHeading>Nodes</SectionHeading>
        {nodes.error ? <ErrorBox message={nodes.error} /> :
         nodes.loading ? <p className="text-sm text-foggy">Loading...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nodes.data?.map(node => {
              const diskUsedPct = node.diskTotalBytes && node.diskAvailableBytes
                ? (1 - node.diskAvailableBytes / node.diskTotalBytes) * 100
                : 0

              return (
                <div key={node.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-hof">{node.name}</p>
                      <p className="text-xs text-foggy font-mono mt-0.5">{node.host}</p>
                    </div>
                    <span className="text-xs text-foggy bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                      v{node.version}
                    </span>
                  </div>

                  {/* Role pills — neutral, not alarming */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {node.roles.map(role => (
                      <span key={role} className="text-xs font-medium bg-gray-100 text-foggy border border-gray-200 px-2 py-0.5 rounded-full">
                        {role}
                      </span>
                    ))}
                  </div>

                  {node.heapPercent !== undefined && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-foggy">
                        <span>Heap</span>
                        <span className={`font-medium ${node.heapPercent > 85 ? 'text-rausch' : node.heapPercent > 70 ? 'text-ariel' : 'text-hof'}`}>
                          {node.heapPercent.toFixed(1)}% — {formatBytes(node.heapUsedBytes!)} / {formatBytes(node.heapMaxBytes!)}
                        </span>
                      </div>
                      <ProgressBar
                        value={node.heapPercent}
                        color={node.heapPercent > 85 ? 'bg-rausch' : node.heapPercent > 70 ? 'bg-ariel' : 'bg-balearic'}
                      />
                    </div>
                  )}

                  {node.diskTotalBytes && node.diskAvailableBytes && (
                    <div>
                      <div className="flex justify-between text-xs text-foggy">
                        <span>Disk used</span>
                        <span className={`font-medium ${diskUsedPct > 90 ? 'text-rausch' : diskUsedPct > 75 ? 'text-ariel' : 'text-hof'}`}>
                          {diskUsedPct.toFixed(1)}% — {formatBytes(node.diskTotalBytes - node.diskAvailableBytes)} / {formatBytes(node.diskTotalBytes)}
                        </span>
                      </div>
                      <ProgressBar
                        value={diskUsedPct}
                        color={diskUsedPct > 90 ? 'bg-rausch' : diskUsedPct > 75 ? 'bg-ariel' : 'bg-gray-400'}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Settings */}
      <section>
        <SectionHeading>Cluster settings</SectionHeading>
        {settings.error ? <ErrorBox message={settings.error} /> :
         settings.loading ? <p className="text-sm text-foggy">Loading...</p> :
         settings.data && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {([
              ['Persistent', settings.data.persistent],
              ['Transient',  settings.data.transient],
            ] as [string, Record<string, unknown>][]).map(([label, data]) => (
              <div key={label} className="border-b border-gray-100 last:border-0">
                <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-semibold text-foggy uppercase tracking-wide">{label}</p>
                </div>
                {Object.keys(data).length === 0 ? (
                  <p className="px-5 py-3 text-xs text-gray-400 italic">No settings configured</p>
                ) : (
                  <table className="w-full text-xs font-mono">
                    <tbody>
                      {Object.entries(data).map(([key, value]) => (
                        <tr key={key} className="border-t border-gray-50">
                          <td className="px-5 py-2 text-foggy w-1/2">{key}</td>
                          <td className="px-5 py-2 text-hof">{JSON.stringify(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
