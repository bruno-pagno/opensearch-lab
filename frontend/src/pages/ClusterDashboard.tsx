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

const STATUS_DOT: Record<string, string> = {
  green:  'bg-balearic',
  yellow: 'bg-ariel',
  red:    'bg-rausch',
}

const STATUS_LABEL: Record<string, string> = {
  green:  'text-balearic',
  yellow: 'text-ariel',
  red:    'text-rausch',
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 / 1024 / 1024
  if (gb >= 1) return `${gb.toFixed(1)} GB`
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-foggy uppercase tracking-widest mb-3">{children}</h2>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="text-rausch text-sm bg-red-50 border border-red-200 rounded-xl p-4">{message}</div>
  )
}


export default function ClusterDashboard() {
  const health = useFetch<ClusterHealth>('/api/cluster/health')
  const nodes = useFetch<NodeInfo[]>('/api/cluster/nodes')
  const settings = useFetch<ClusterSettings>('/api/cluster/settings')

  const status = health.data?.status ?? 'red'

  return (
    <div className="space-y-8">

      {/* Health */}
      <section>
        <SectionHeading>Cluster Health</SectionHeading>
        {health.error ? <ErrorBox message={health.error} /> :
         health.loading ? <p className="text-sm text-foggy">Loading...</p> :
         health.data && (
          <Card className="p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[status]}`} />
              <span className={`text-base font-semibold uppercase tracking-wide ${STATUS_LABEL[status]}`}>{status}</span>
              <span className="text-foggy text-sm">{health.data.clusterName}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {([
                ['Nodes',           health.data.numberOfNodes],
                ['Data nodes',      health.data.numberOfDataNodes],
                ['Active shards',   health.data.activeShards],
                ['Primary shards',  health.data.activePrimaryShards],
                ['Relocating',      health.data.relocatingShards],
                ['Initializing',    health.data.initializingShards],
                ['Unassigned',      health.data.unassignedShards],
              ] as [string, number][]).map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-foggy mb-0.5">{label}</p>
                  <p className="text-2xl font-bold text-hof">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>

      {/* Nodes */}
      <section>
        <SectionHeading>Nodes</SectionHeading>
        {nodes.error ? <ErrorBox message={nodes.error} /> :
         nodes.loading ? <p className="text-sm text-foggy">Loading...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nodes.data?.map(node => (
              <Card key={node.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-hof">{node.name}</p>
                    <p className="text-xs text-foggy font-mono mt-0.5">{node.host}</p>
                  </div>
                  <span className="text-xs text-foggy bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                    v{node.version}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {node.roles.map(role => (
                    <span key={role} className="text-xs font-medium bg-red-50 text-rausch border border-red-200 px-2 py-0.5 rounded-full">
                      {role}
                    </span>
                  ))}
                </div>

                {node.heapPercent !== undefined && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-foggy">
                      <span>Heap</span>
                      <span className="font-medium text-hof">
                        {node.heapPercent.toFixed(1)}% &mdash; {formatBytes(node.heapUsedBytes!)} / {formatBytes(node.heapMaxBytes!)}
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
                      <span>Disk available</span>
                      <span className="font-medium text-hof">
                        {formatBytes(node.diskAvailableBytes)} / {formatBytes(node.diskTotalBytes)}
                      </span>
                    </div>
                    <ProgressBar
                      value={(1 - node.diskAvailableBytes / node.diskTotalBytes) * 100}
                      color="bg-gray-400"
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Settings */}
      <section>
        <SectionHeading>Cluster Settings</SectionHeading>
        {settings.error ? <ErrorBox message={settings.error} /> :
         settings.loading ? <p className="text-sm text-foggy">Loading...</p> :
         settings.data && (
          <Card className="overflow-hidden">
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
          </Card>
        )}
      </section>

    </div>
  )
}
