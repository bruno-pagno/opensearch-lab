import { navigate } from '../utils/navigate'

interface Lab {
  slug: string
  number: number
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  duration: string
  icon: React.ReactNode
}

const LABS: Lab[] = [
  {
    slug: 'unassigned-replicas',
    number: 1,
    title: 'Unassigned Replicas',
    description: 'Break a green cluster by enabling replicas on a single-node setup. Use the allocation explain API to diagnose exactly why the shard is unassigned, then fix it.',
    difficulty: 'Beginner',
    tags: ['shards', 'replicas', 'cluster health', 'allocation'],
    duration: '~5 min',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
]

const DIFFICULTY_STYLE = {
  Beginner:     'bg-green-50 text-green-700 border-green-200',
  Intermediate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Advanced:     'bg-red-50 text-red-700 border-red-200',
}

export default function LabsPage() {
  return (
    <div className="min-h-screen bg-air-bg text-hof">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2z" fill="#FF5A5F" />
            <path d="M14 8c-1.1 0-2 .9-2 2v.5C10.3 11.2 9 12.9 9 15c0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.1-1.3-3.8-3-4.5V10c0-1.1-.9-2-2-2zm0 2.5c.8 0 1.5.7 1.5 1.5S14.8 13.5 14 13.5 12.5 12.8 12.5 12s.7-1.5 1.5-1.5zm0 9c-1.9 0-3.5-1.6-3.5-3.5 0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5c0 1.9-1.6 3.5-3.5 3.5z" fill="white" />
          </svg>
          <div>
            <h1 className="text-base font-semibold leading-tight text-hof">OpenSearch Labs</h1>
            <p className="text-xs text-foggy leading-tight">Airbnb Infrastructure Lab</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/learn" onClick={e => { e.preventDefault(); navigate('/learn') }} className="text-sm text-foggy hover:text-balearic font-medium transition-colors">Learn</a>
          <a href="/" onClick={e => { e.preventDefault(); navigate('/') }} className="text-sm text-foggy hover:text-rausch font-medium transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to search
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-hof mb-3">Incident Labs</h2>
          <p className="text-foggy max-w-2xl">
            Hands-on simulations of real OpenSearch incidents. Each lab walks you through breaking something, diagnosing it with the actual APIs, and recovering — the same workflow you'd use in production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LABS.map(lab => (
            <button
              key={lab.slug}
              onClick={() => navigate(`/labs/${lab.slug}`)}
              className="text-left bg-white rounded-2xl border border-gray-200 p-6 hover:border-rausch hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-rausch/10 text-rausch flex items-center justify-center group-hover:bg-rausch group-hover:text-white transition-colors">
                  {lab.icon}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${DIFFICULTY_STYLE[lab.difficulty]}`}>
                  {lab.difficulty}
                </span>
              </div>

              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-bold text-foggy">Lab {lab.number}</span>
              </div>
              <h3 className="text-lg font-bold text-hof mb-2 group-hover:text-rausch transition-colors">{lab.title}</h3>
              <p className="text-sm text-foggy leading-relaxed mb-4">{lab.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {lab.tags.map(t => (
                    <span key={t} className="text-[11px] bg-gray-100 text-foggy px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
                <span className="text-xs text-foggy ml-3 shrink-0">{lab.duration}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1 text-sm font-semibold text-rausch opacity-0 group-hover:opacity-100 transition-opacity">
                Start lab
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}

          {/* Placeholder for upcoming labs */}
          {[
            { title: 'Disk Watermark Breach', tags: ['disk', 'allocation', 'watermarks'] },
            { title: 'Circuit Breaker Trip', tags: ['memory', 'jvm', 'circuit breaker'] },
          ].map(p => (
            <div key={p.title} className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 opacity-50">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-xs font-bold text-foggy">Coming soon</span>
              <h3 className="text-lg font-bold text-gray-400 mt-1 mb-2">{p.title}</h3>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map(t => (
                  <span key={t} className="text-[11px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
