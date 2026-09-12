import ClusterDashboard from './pages/ClusterDashboard'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">OpenSearch Learning</h1>
        <p className="text-sm text-gray-400 mt-0.5">Airbnb Infrastructure Lab</p>
      </header>
      <nav className="border-b border-gray-800 px-6">
        <ul className="flex gap-1">
          <li>
            <button className="px-4 py-3 text-sm font-medium text-blue-400 border-b-2 border-blue-400">
              Phase 1 — Cluster
            </button>
          </li>
        </ul>
      </nav>
      <main className="p-6">
        <ClusterDashboard />
      </main>
    </div>
  )
}
