import { useEffect, useState } from 'react'

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

const STATUS_COLORS = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
}

const STATUS_TEXT = {
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 / 1024 / 1024
  if (gb >= 1) return `${gb.toFixed(1)} GB`
  const mb = bytes / 1024 / 1024
  return `${mb.toFixed(0)} MB`
}

function ProgressBar({ value, className }: { value: number; className: string }) {
  return (
    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
      <div className={`h-1.5 rounded-full ${className}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

function useFetch<T>(url: string, interval = 10000) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        setData(await res.json())
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    load()
    const id = setInterval(load, interval)
    return () => clearInterval(id)
  }, [url, interval])

  return { data, error, loading }
}

export default function ClusterDashboard() {
  const health = useFetch<ClusterHealth>('/api/cluster/health')
  const nodes = useFetch<NodeInfo[]>('/api/cluster/nodes')
  const settings = useFetch<ClusterSettings>('/api/cluster/settings')

  const status = health.data?.status ?? 'red'

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Health */}
      <section>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Cluster Health</h2>
        {health.error ? (
          <div className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg p-4">{health.error}</div>
        ) : health.loading ? (
          <div className="text-gray-500 text-sm">Loading...</div>
        ) : health.data && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`} />
              <span className={`text-lg font-semibold uppercase ${STATUS_TEXT[status]}`}>{status}</span>
              <span className="text-gray-400 text-sm">— {health.data.clusterName}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Nodes', value: health.data.numberOfNodes },
                { label: 'Data Nodes', value: health.data.numberOfDataNodes },
                { label: 'Active Shards', value: health.data.activeShards },
                { label: 'Primary Shards', value: health.data.activePrimaryShards },
                { label: 'Relocating', value: health.data.relocatingShards },
                { label: 'Initializing', value: health.data.initializingShards },
                { label: 'Unassigned', value: health.data.unassignedShards },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xl font-mono font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Nodes */}
      <section>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Nodes</h2>
        {nodes.error ? (
          <div className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg p-4">{nodes.error}</div>
        ) : nodes.loading ? (
          <div className="text-gray-500 text-sm">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nodes.data?.map(node => (
              <div key={node.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{node.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{node.host}</p>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">v{node.version}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {node.roles.map(role => (
                    <span key={role} className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">{role}</span>
                  ))}
                </div>
                {node.heapPercent !== undefined && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Heap</span>
                      <span>{node.heapPercent.toFixed(1)}% — {formatBytes(node.heapUsedBytes!)} / {formatBytes(node.heapMaxBytes!)}</span>
                    </div>
                    <ProgressBar
                      value={node.heapPercent}
                      className={node.heapPercent > 85 ? 'bg-red-500' : node.heapPercent > 70 ? 'bg-yellow-400' : 'bg-blue-500'}
                    />
                  </div>
                )}
                {node.diskTotalBytes && node.diskAvailableBytes && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Disk available</span>
                      <span>{formatBytes(node.diskAvailableBytes)} / {formatBytes(node.diskTotalBytes)}</span>
                    </div>
                    <ProgressBar
                      value={(1 - node.diskAvailableBytes / node.diskTotalBytes) * 100}
                      className="bg-gray-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Settings */}
      <section>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Cluster Settings</h2>
        {settings.error ? (
          <div className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg p-4">{settings.error}</div>
        ) : settings.loading ? (
          <div className="text-gray-500 text-sm">Loading...</div>
        ) : settings.data && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            {[
              { label: 'Persistent', data: settings.data.persistent },
              { label: 'Transient', data: settings.data.transient },
            ].map(({ label, data }) => (
              <div key={label} className="border-b border-gray-800 last:border-0">
                <div className="px-4 py-2 bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-400">{label}</p>
                </div>
                {Object.keys(data).length === 0 ? (
                  <p className="px-4 py-3 text-xs text-gray-600 italic">No settings configured</p>
                ) : (
                  <table className="w-full text-xs font-mono">
                    <tbody>
                      {Object.entries(data).map(([key, value]) => (
                        <tr key={key} className="border-t border-gray-800/50">
                          <td className="px-4 py-2 text-gray-400 w-1/2">{key}</td>
                          <td className="px-4 py-2 text-gray-200">{JSON.stringify(value)}</td>
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
