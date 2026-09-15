import { useRef, useState } from 'react'
import { QueryLog } from '../components/QueryLog'
import { navigate } from '../utils/navigate'

// ─── Types ────────────────────────────────────────────────────────────────────

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
  score: number
}

interface SearchResult {
  listings: Listing[]
  total: number
  maxScore: number
  executedQuery: string
}

interface Filters {
  roomType: string
  minPrice: string
  maxPrice: string
  amenities: string[]
  minRating: string
  queryType: 'best_fields' | 'most_fields' | 'cross_fields' | 'phrase'
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 9

const DEFAULT_FILTERS: Filters = {
  roomType: '',
  minPrice: '',
  maxPrice: '',
  amenities: [],
  minRating: '',
  queryType: 'best_fields',
}

const ROOM_TYPES = [
  { value: '',                label: 'Any type' },
  { value: 'Entire home/apt', label: 'Entire place' },
  { value: 'Private room',    label: 'Private room' },
  { value: 'Shared room',     label: 'Shared room' },
]

const RATINGS = [
  { value: '',    label: 'Any' },
  { value: '4.0', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
  { value: '4.8', label: '4.8+' },
]

const AMENITY_LIST = [
  'WiFi', 'Kitchen', 'Pool', 'HotTub', 'Parking',
  'AC', 'Washer', 'Dryer', 'TV', 'Gym',
  'Fireplace', 'BBQ', 'Beach', 'PetFriendly', 'Balcony',
]

const QUERY_TYPES: { value: Filters['queryType']; label: string; desc: string }[] = [
  { value: 'best_fields',  label: 'Best fields',  desc: 'Score from the single best-matching field. Good for most searches.' },
  { value: 'most_fields',  label: 'Most fields',  desc: 'Higher score when the query appears in more fields simultaneously.' },
  { value: 'cross_fields', label: 'Cross fields',  desc: 'Treats all fields as one. Best when terms can span fields, e.g. "San Francisco cozy".' },
  { value: 'phrase',       label: 'Phrase',        desc: 'Terms must appear in order and adjacent. Strict but precise.' },
]

const SUGGESTIONS = ['beach', 'mountain cabin', 'New York', 'pool', 'cozy fireplace', 'pet friendly']

const CARD_GRADIENTS = [
  'from-orange-300 to-pink-300',
  'from-blue-300 to-cyan-300',
  'from-purple-300 to-pink-300',
  'from-emerald-300 to-teal-300',
  'from-yellow-300 to-orange-300',
  'from-indigo-300 to-blue-300',
  'from-rose-300 to-orange-300',
  'from-teal-300 to-cyan-300',
  'from-sky-300 to-blue-300',
]

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score, maxScore }: { score: number; maxScore: number }) {
  if (maxScore === 0) return null
  const pct = score / maxScore
  const style = pct >= 0.8 ? 'bg-green-500/90 text-white'
    : pct >= 0.5 ? 'bg-yellow-400/90 text-white'
    : 'bg-gray-500/80 text-white'
  return (
    <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm ${style}`}>
      {score.toFixed(2)}
    </span>
  )
}

// ─── Listing card ─────────────────────────────────────────────────────────────

function ListingCard({ listing, index, maxScore }: { listing: Listing; index: number; maxScore: number }) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`h-44 bg-gradient-to-br ${gradient} relative`}>
        <div className="absolute inset-0 flex items-end p-3">
          <span className="text-white text-xs font-semibold bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {listing.city}, {listing.country}
          </span>
        </div>
        <ScoreBadge score={listing.score} maxScore={maxScore} />
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

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null

  const pages: (number | '…')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('…')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('…')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1 py-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 rounded-lg text-sm text-foggy hover:text-hof hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-2 py-2 text-sm text-foggy">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              p === page ? 'bg-rausch text-white' : 'text-foggy hover:text-hof hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 rounded-lg text-sm text-foggy hover:text-hof hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  )
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterBar({ filters, onUpdate, onToggleAmenity, onPrice, onClearAll }: {
  filters: Filters
  onUpdate: (key: keyof Filters, value: string) => void
  onToggleAmenity: (a: string) => void
  onPrice: (key: 'minPrice' | 'maxPrice', v: string) => void
  onClearAll: () => void
}) {
  const [showAmenities, setShowAmenities] = useState(false)
  const activeCount = (filters.roomType ? 1 : 0)
    + (filters.minPrice || filters.maxPrice ? 1 : 0)
    + filters.amenities.length
    + (filters.minRating ? 1 : 0)

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
      active
        ? 'bg-hof text-white border-hof'
        : 'bg-white text-foggy border-gray-200 hover:border-hof hover:text-hof'
    }`

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 space-y-3">
      {/* Row 1: room type, price, rating, query type */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Room type */}
        <div className="flex items-center gap-1.5">
          {ROOM_TYPES.map(rt => (
            <button
              key={rt.value}
              onClick={() => onUpdate('roomType', rt.value)}
              className={pill(filters.roomType === rt.value)}
            >
              {rt.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-200 hidden sm:block" />

        {/* Price */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-foggy font-medium">Price</span>
          <div className="flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1.5 bg-white">
            <span className="text-foggy">$</span>
            <input
              type="number"
              placeholder="min"
              value={filters.minPrice}
              onChange={e => onPrice('minPrice', e.target.value)}
              className="w-14 text-xs text-hof outline-none"
            />
            <span className="text-gray-300 mx-0.5">–</span>
            <span className="text-foggy">$</span>
            <input
              type="number"
              placeholder="max"
              value={filters.maxPrice}
              onChange={e => onPrice('maxPrice', e.target.value)}
              className="w-14 text-xs text-hof outline-none"
            />
          </div>
        </div>

        <div className="w-px h-5 bg-gray-200 hidden sm:block" />

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-foggy font-medium">Rating</span>
          {RATINGS.map(r => (
            <button
              key={r.value}
              onClick={() => onUpdate('minRating', r.value)}
              className={pill(filters.minRating === r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-200 hidden sm:block ml-auto" />

        {/* Amenities toggle */}
        <button
          onClick={() => setShowAmenities(s => !s)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            filters.amenities.length > 0 || showAmenities
              ? 'bg-hof text-white border-hof'
              : 'bg-white text-foggy border-gray-200 hover:border-hof hover:text-hof'
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Amenities{filters.amenities.length > 0 ? ` (${filters.amenities.length})` : ''}
        </button>

        {activeCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-rausch hover:underline ml-1"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Row 2: amenities (collapsible) */}
      {showAmenities && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {AMENITY_LIST.map(a => (
            <button
              key={a}
              onClick={() => onToggleAmenity(a)}
              className={pill(filters.amenities.includes(a))}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {/* Row 3: query type */}
      <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
        <span className="text-xs text-foggy font-medium shrink-0">Query type</span>
        <div className="flex flex-wrap gap-1.5">
          {QUERY_TYPES.map(qt => (
            <button
              key={qt.value}
              onClick={() => onUpdate('queryType', qt.value)}
              className={pill(filters.queryType === qt.value)}
              title={qt.desc}
            >
              {qt.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-foggy hidden md:block">
          {QUERY_TYPES.find(q => q.value === filters.queryType)?.desc}
        </span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [input, setInput] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queryLog, setQueryLog] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalPages = result ? Math.ceil(result.total / PAGE_SIZE) : 1

  async function doSearch(q: string, p: number, f: Filters) {
    setLoading(true)
    setError(null)
    setQueryLog(null)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (f.roomType) params.set('roomType', f.roomType)
      if (f.minPrice) params.set('minPrice', f.minPrice)
      if (f.maxPrice) params.set('maxPrice', f.maxPrice)
      f.amenities.forEach(a => params.append('amenities', a))
      if (f.minRating) params.set('minRating', f.minRating)
      params.set('queryType', f.queryType)
      params.set('from', String((p - 1) * PAGE_SIZE))
      params.set('size', String(PAGE_SIZE))

      const res = await fetch(`/api/search/listings?${params}`)
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
    setActiveQuery(input)
    setPage(1)
    doSearch(input, 1, filters)
  }

  function handleSuggestion(s: string) {
    setInput(s)
    setActiveQuery(s)
    setPage(1)
    doSearch(s, 1, filters)
  }

  function updateFilter(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    if (searched) { setPage(1); doSearch(activeQuery, 1, next) }
  }

  function toggleAmenity(a: string) {
    const next = {
      ...filters,
      amenities: filters.amenities.includes(a)
        ? filters.amenities.filter(x => x !== a)
        : [...filters.amenities, a],
    }
    setFilters(next)
    if (searched) { setPage(1); doSearch(activeQuery, 1, next) }
  }

  function updatePrice(key: 'minPrice' | 'maxPrice', value: string) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    if (priceTimer.current) clearTimeout(priceTimer.current)
    if (searched) {
      priceTimer.current = setTimeout(() => { setPage(1); doSearch(activeQuery, 1, next) }, 600)
    }
  }

  function clearAllFilters() {
    const next = DEFAULT_FILTERS
    setFilters(next)
    if (searched) { setPage(1); doSearch(activeQuery, 1, next) }
  }

  function changePage(p: number) {
    setPage(p)
    doSearch(activeQuery, p, filters)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasResults = result && result.listings.length > 0

  return (
    <div className="min-h-screen bg-air-bg">
      {/* Nav header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2z" fill="#FF5A5F" />
            <path d="M14 8c-1.1 0-2 .9-2 2v.5C10.3 11.2 9 12.9 9 15c0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.1-1.3-3.8-3-4.5V10c0-1.1-.9-2-2-2zm0 2.5c.8 0 1.5.7 1.5 1.5S14.8 13.5 14 13.5 12.5 12.8 12.5 12s.7-1.5 1.5-1.5zm0 9c-1.9 0-3.5-1.6-3.5-3.5 0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5c0 1.9-1.6 3.5-3.5 3.5z" fill="white" />
          </svg>
          <span className="text-sm font-semibold text-hof">OpenSearch Lab</span>
        </div>
        <nav className="flex items-center gap-4">
          <button onClick={() => navigate('/learn')} className="text-xs font-medium text-foggy hover:text-balearic transition-colors">Learn</button>
          <button onClick={() => navigate('/labs')} className="text-xs font-medium text-foggy hover:text-rausch transition-colors">Labs</button>
          <button onClick={() => navigate('/admin')} className="text-xs font-medium text-foggy hover:text-hof transition-colors">Admin</button>
        </nav>
      </header>

      {/* Search area */}
      <div className={`transition-all ${searched ? 'bg-white border-b border-gray-200 pt-4 pb-4' : 'pt-20 pb-16'}`}>
        <div className="max-w-3xl mx-auto px-6">
          {!searched && (
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-hof mb-2">Find your perfect stay</h1>
              <p className="text-foggy">Powered by OpenSearch — try different query types and filters</p>
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
                placeholder="Search by city, amenity, or vibe…"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rausch bg-white shadow-sm"
                autoFocus={!searched}
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
                  onClick={() => handleSuggestion(s)}
                  className="text-xs text-foggy border border-gray-200 bg-white rounded-full px-3 py-1 hover:border-rausch hover:text-rausch transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {searched && (
        <FilterBar
          filters={filters}
          onUpdate={updateFilter}
          onToggleAmenity={toggleAmenity}
          onPrice={updatePrice}
          onClearAll={clearAllFilters}
        />
      )}

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {error && (
          <div className="text-rausch text-sm bg-red-50 border border-red-200 rounded-xl p-4 mb-6">{error}</div>
        )}

        {searched && result && (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-foggy">
                {result.total === 0
                  ? 'No listings found.'
                  : `${result.total} listing${result.total !== 1 ? 's' : ''}${activeQuery ? ` for "${activeQuery}"` : ''}`}
              </p>
              {result.maxScore > 0 && (
                <div className="flex items-center gap-3 text-xs text-foggy">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" /> top score {result.maxScore.toFixed(2)}
                  </span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                    {QUERY_TYPES.find(q => q.value === filters.queryType)?.label}
                  </span>
                </div>
              )}
            </div>

            {hasResults && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {result.listings.map((listing, i) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      index={(page - 1) * PAGE_SIZE + i}
                      maxScore={result.maxScore}
                    />
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={changePage} />
              </>
            )}
          </>
        )}

        {/* Pre-search feature cards */}
        {!searched && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              {
                path: '/learn',
                color: 'bg-balearic/10 text-balearic border-balearic/20',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                title: 'Learn',
                desc: 'Visual explanations of clusters, shards, replicas, and how OpenSearch stores data.',
              },
              {
                path: '/labs',
                color: 'bg-rausch/10 text-rausch border-rausch/20',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                ),
                title: 'Labs',
                desc: 'Simulate real incidents — unassigned shards, disk watermarks — and recover using the same APIs you\'d use in production.',
              },
              {
                path: '/admin',
                color: 'bg-hof/10 text-hof border-hof/20',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Admin',
                desc: 'Live cluster health, index management, JVM metrics, and shard allocation — all from one panel.',
              },
            ].map(card => (
              <button
                key={card.path}
                onClick={() => navigate(card.path)}
                className={`text-left rounded-2xl border p-5 hover:shadow-sm transition-all group ${card.color}`}
              >
                <div className="mb-3">{card.icon}</div>
                <h3 className="font-bold mb-1 group-hover:underline">{card.title}</h3>
                <p className="text-xs opacity-80 leading-relaxed">{card.desc}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <QueryLog query={queryLog} onDismiss={() => setQueryLog(null)} />
    </div>
  )
}
