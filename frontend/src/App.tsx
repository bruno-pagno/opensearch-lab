import { useEffect, useState } from 'react'
import ClusterDashboard from './pages/ClusterDashboard'
import IndicesDashboard from './pages/IndicesDashboard'
import MetricsDashboard from './pages/MetricsDashboard'
import SearchPage from './pages/SearchPage'
import LearnPage from './pages/LearnPage'
import LabsPage from './pages/LabsPage'
import LabDetail from './pages/LabDetail'
import { navigate } from './utils/navigate'

type AdminTab = 'cluster' | 'indices' | 'metrics'
type Page = 'search' | 'admin' | 'learn' | 'labs' | 'lab-detail'

const ADMIN_NAV: { id: AdminTab; label: string }[] = [
  { id: 'cluster', label: 'Cluster' },
  { id: 'indices', label: 'Indices' },
  { id: 'metrics', label: 'Metrics' },
]

function getPage(): Page {
  const p = window.location.pathname
  if (p.startsWith('/admin')) return 'admin'
  if (p.startsWith('/learn')) return 'learn'
  if (p.startsWith('/labs/')) return 'lab-detail'
  if (p === '/labs') return 'labs'
  return 'search'
}

export default function App() {
  const [page, setPage] = useState<Page>(getPage)
  const [tab, setTab] = useState<AdminTab>('cluster')

  useEffect(() => {
    const onPop = () => setPage(getPage())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (page === 'learn') return <LearnPage />
  if (page === 'labs') return <LabsPage />
  if (page === 'lab-detail') return <LabDetail />
  if (page === 'search') return <SearchPage />

  return (
    <div className="min-h-screen bg-air-bg text-hof">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2z" fill="#FF5A5F" />
            <path d="M14 8c-1.1 0-2 .9-2 2v.5C10.3 11.2 9 12.9 9 15c0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.1-1.3-3.8-3-4.5V10c0-1.1-.9-2-2-2zm0 2.5c.8 0 1.5.7 1.5 1.5S14.8 13.5 14 13.5 12.5 12.8 12.5 12s.7-1.5 1.5-1.5zm0 9c-1.9 0-3.5-1.6-3.5-3.5 0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5c0 1.9-1.6 3.5-3.5 3.5z" fill="white" />
          </svg>
          <div>
            <h1 className="text-base font-semibold leading-tight text-hof">OpenSearch Admin</h1>
            <p className="text-xs text-foggy leading-tight">Airbnb Infrastructure Lab</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/learn"
            onClick={e => { e.preventDefault(); navigate('/learn') }}
            className="text-sm text-foggy hover:text-balearic font-medium transition-colors"
          >
            Learn
          </a>
          <a
            href="/"
            onClick={e => { e.preventDefault(); navigate('/') }}
            className="text-sm text-foggy hover:text-rausch font-medium transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to search
          </a>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 px-8">
        <ul className="flex">
          {ADMIN_NAV.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => setTab(id)}
                className={`px-4 py-3 text-sm font-semibold mr-2 border-b-2 transition-colors ${
                  tab === id
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
        {tab === 'cluster' && <ClusterDashboard />}
        {tab === 'indices'  && <IndicesDashboard />}
        {tab === 'metrics'  && <MetricsDashboard />}
      </main>
    </div>
  )
}
