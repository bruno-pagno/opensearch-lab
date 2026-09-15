import { useState } from 'react'
import { QueryLog } from '../components/QueryLog'
import { navigate } from '../utils/navigate'

interface Listing {
  id: string
  title: string
  description: string
  pricePerNight: number
  roomType: string
  rating: number
  numReviews: number
  hostName: string
  city: string
  country: string
  amenities: string[]
}

interface SearchResult {
  listings: Listing[]
  total: number
  executedQuery: string
}

const CARD_GRADIENTS = [
  'from-orange-300 to-pink-300',
  'from-blue-300 to-cyan-300',
  'from-purple-300 to-pink-300',
  'from-emerald-300 to-teal-300',
  'from-yellow-300 to-orange-300',
  'from-indigo-300 to-blue-300',
  'from-rose-300 to-orange-300',
  'from-teal-300 to-cyan-300',
]

const SUGGESTIONS = ['beach', 'mountain', 'New York', 'loft', 'cozy', 'pool', 'cabin']

function ListingCard({ listing, index }: { listing: Listing; index: number }) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Placeholder image */}
      <div className={`h-44 bg-gradient-to-br ${gradient} relative`}>
        <div className="absolute inset-0 flex items-end p-3">
          <span className="text-white text-xs font-semibold bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {listing.city}, {listing.country}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <p className="font-semibold text-hof text-sm leading-tight flex-1 mr-2">{listing.title}</p>
          <div className="flex items-center gap-1 shrink-0">
            <svg className="w-3 h-3 text-rausch" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-semibold text-hof">{listing.rating.toFixed(1)}</span>
            <span className="text-xs text-foggy">({listing.numReviews})</span>
          </div>
        </div>

        <p className="text-xs text-foggy mb-2">{listing.roomType}</p>
        <p className="text-xs text-foggy line-clamp-2 mb-3">{listing.description}</p>

        {listing.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.amenities.slice(0, 4).map(a => (
              <span key={a} className="text-xs bg-gray-100 text-foggy px-1.5 py-0.5 rounded-full">{a}</span>
            ))}
            {listing.amenities.length > 4 && (
              <span className="text-xs text-foggy">+{listing.amenities.length - 4}</span>
            )}
          </div>
        )}

        <p className="text-sm font-bold text-hof">
          ${listing.pricePerNight.toFixed(0)}
          <span className="text-xs font-normal text-foggy"> / night</span>
        </p>
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queryLog, setQueryLog] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  async function doSearch(q: string) {
    setLoading(true)
    setError(null)
    setQueryLog(null)
    try {
      const res = await fetch(`/api/search/listings?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data: SearchResult = await res.json()
      setResult(data)
      setQueryLog(data.executedQuery)
      setSearched(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    doSearch(input)
  }

  const hasResults = result && result.listings.length > 0

  return (
    <div className="min-h-screen bg-air-bg">

      {/* Search bar — compact when results exist, hero when empty */}
      <div className={`transition-all ${searched ? 'pt-6 pb-5 border-b border-gray-200 bg-white' : 'pt-24 pb-20'}`}>
        <div className="max-w-3xl mx-auto px-6">
          {!searched && (
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-hof mb-2">Find your perfect stay</h1>
              <p className="text-foggy">Search listings across cities, amenities, and room types</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foggy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Search by city, amenity, or room type…"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rausch bg-white shadow-sm"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-rausch text-white text-sm font-semibold rounded-xl hover:bg-red-500 disabled:opacity-60 transition-colors shadow-sm whitespace-nowrap"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </form>

          {!searched && (
            <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
              <span className="text-xs text-foggy">Try:</span>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); doSearch(s) }}
                  className="text-xs text-foggy border border-gray-200 bg-white rounded-full px-3 py-1 hover:border-rausch hover:text-rausch transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {error && (
          <div className="text-rausch text-sm bg-red-50 border border-red-200 rounded-xl p-4 mb-6">{error}</div>
        )}

        {searched && result && (
          <>
            <p className="text-sm text-foggy mb-5">
              {result.total === 0
                ? 'No listings found.'
                : `${result.total} listing${result.total > 1 ? 's' : ''}${input ? ` for "${input}"` : ''}`}
            </p>

            {hasResults && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {result.listings.map((listing, i) => (
                  <ListingCard key={listing.id} listing={listing} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        {!searched && !loading && (
          <p className="text-center text-foggy text-sm mt-4">
            Go to{' '}
            <button
              onClick={() => navigate('/admin')}
              className="text-rausch font-medium hover:underline"
            >
              Admin
            </button>
            {' '}to seed the listings dataset, or visit{' '}
            <button
              onClick={() => navigate('/learn')}
              className="text-balearic font-medium hover:underline"
            >
              Learn
            </button>
            {' '}to explore OpenSearch concepts.
          </p>
        )}
      </div>

      <QueryLog query={queryLog} onDismiss={() => setQueryLog(null)} />
    </div>
  )
}
