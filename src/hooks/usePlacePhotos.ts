import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const BUCKET = 'place-photos'

export interface PlacePhoto {
  id: string
  place_id: string
  storage_path: string
  created_at: string
  url: string
}

function withPublicUrl(row: { id: string; place_id: string; storage_path: string; created_at: string }): PlacePhoto {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(row.storage_path)
  return { ...row, url: data.publicUrl }
}

export function usePlacePhotos(placeId: string | undefined) {
  const [photos, setPhotos] = useState<PlacePhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enabled = Boolean(placeId && import.meta.env.VITE_SUPABASE_URL)

  const fetchPhotos = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('place_photos')
      .select('id, place_id, storage_path, created_at')
      .eq('place_id', placeId)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    setPhotos((data || []).map(withPublicUrl))
    setLoading(false)
  }, [enabled, placeId])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const uploadPhoto = useCallback(
    async (file: File) => {
      if (!placeId) return
      setUploading(true)
      setError(null)
      try {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${placeId}/${crypto.randomUUID()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false })
        if (uploadErr) throw uploadErr

        const { data: row, error: insertErr } = await supabase
          .from('place_photos')
          .insert({ place_id: placeId, storage_path: path })
          .select('id, place_id, storage_path, created_at')
          .single()
        if (insertErr) throw insertErr

        if (row) setPhotos(prev => [withPublicUrl(row), ...prev])
      } catch (e) {
        setError(e instanceof Error ? e.message : '업로드 실패')
      } finally {
        setUploading(false)
      }
    },
    [placeId]
  )

  return { photos, loading, uploading, error, uploadPhoto }
}
