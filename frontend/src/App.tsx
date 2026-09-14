import { useState } from 'react'
import ClusterDashboard from './pages/ClusterDashboard'
import IndicesDashboard from './pages/IndicesDashboard'
import MetricsDashboard from './pages/MetricsDashboard'

type Page = 'cluster' | 'indices' | 'metrics'

const NAV: { id: Page; label: string }[] = [
  { id: 'cluster', label: 'Cluster' },
  { id: 'indices', label: 'Indices' },
  { id: 'metrics', label: 'Metrics' },
]

export default function App() {
  const [page, setPage] = useState<Page>('cluster')

  return (
    <div className="min-h-screen bg-air-bg text-hof">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-3">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2z" fill="#FF5A5F" />
          <path d="M14 8c-1.1 0-2 .9-2 2v.5C10.3 11.2 9 12.9 9 15c0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.1-1.3-3.8-3-4.5V10c0-1.1-.9-2-2-2zm0 2.5c.8 0 1.5.7 1.5 1.5S14.8 13.5 14 13.5 12.5 12.8 12.5 12s.7-1.5 1.5-1.5zm0 9c-1.9 0-3.5-1.6-3.5-3.5 0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5c0 1.9-1.6 3.5-3.5 3.5z" fill="white" />
        </svg>
        <div>
          <h1 className="text-base font-semibold leading-tight text-hof">OpenSearch Learning</h1>
          <p className="text-xs text-foggy leading-tight">Airbnb Infrastructure Lab</p>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 px-8">
        <ul className="flex">
          {NAV.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => setPage(id)}
                className={`px-4 py-3 text-sm font-semibold mr-2 border-b-2 transition-colors ${
                  page === id
                    ? 'text-rausch border-rausch'
                    : 'text-foggy border-transparent hover:text-hof'
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="px-8 py-6 max-w-5xl">
        {page === 'cluster'  && <ClusterDashboard />}
        {page === 'indices'  && <IndicesDashboard />}
        {page === 'metrics'  && <MetricsDashboard />}
      </main>
    </div>
  )
}
