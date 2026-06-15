import { useState, useEffect } from 'react'
import type { Place } from '../types'
import { supabase } from '../lib/supabase'
import { mockPlaces } from '../data/mockPlaces'

export function usePlaces(lat: number, lng: number, category: string) {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      if (!import.meta.env.VITE_SUPABASE_URL) {
        const filtered = category === 'all' ? mockPlaces : mockPlaces.filter(p => p.category === category)
        setPlaces(filtered)
        setLoading(false)
        return
      }
      let query = supabase.from('places').select('*').eq('status', 'approved')
      if (category !== 'all') query = query.eq('category', category)
      const { data, error } = await query
      console.log('[usePlaces] data:', data, 'error:', error)
      setPlaces(data || [])
      setLoading(false)
    }
    load()
  }, [lat, lng, category])

  return { places, loading }
}
