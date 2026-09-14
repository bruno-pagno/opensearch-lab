import { useEffect, useState } from 'react'

export function useFetch<T>(url: string, interval = 10000) {
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
