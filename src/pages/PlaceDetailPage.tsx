import { useEffect, useRef, useState, Fragment } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import { mockPlaces } from '../data/mockPlaces'
import { usePlacePhotos } from '../hooks/usePlacePhotos'
import type { Place } from '../types'

function Multiline({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>{i > 0 && <br />}{line}</Fragment>
      ))}
    </span>
  )
}

const CATEGORY_LABEL: Record<Place['category'], string> = {
  cafe: '카페',
  restaurant: '식당',
  dessert: '디저트',
}

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [place, setPlace] = useState<Place | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { photos, loading: photosLoading, uploading, error: photoError, uploadPhoto } = usePlacePhotos(id)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadPhoto(file)
    e.target.value = ''
  }

  useEffect(() => {
    async function load() {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        setPlace(mockPlaces.find(p => p.id === id) || null)
        return
      }
      const { data } = await supabase.from('places').select('*').eq('id', id).single()
      setPlace(data)
    }
    load()
  }, [id])

  if (!place) return (
    <div className="max-w-[430px] mx-auto h-screen flex items-center justify-center text-gray-400">
      로딩 중...
    </div>
  )

  // 길찾기 버튼: DB에 값이 있을 때만 노출 (동적 URL 생성 없음)
  const kakaoUrl = place.map_url
  const naverUrl = place.naver_map_url
  const hasMapLinks = Boolean(kakaoUrl || naverUrl)

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-white">
      <Helmet>
        <title>{place.name} — 러너스 디스카운트</title>
        <meta name="description" content={`${place.name}: ${place.discount_content}`} />
        <meta property="og:title" content={`${place.name} — 러너 할인`} />
        <meta property="og:description" content={place.discount_content} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: place.name,
          address: place.address,
          geo: { '@type': 'GeoCoordinates', latitude: place.lat, longitude: place.lng },
          description: place.discount_content,
        })}</script>
      </Helmet>
      {/* 헤더 */}
      <div className="flex items-center px-4 py-4 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="text-gray-600 text-lg" aria-label="뒤로가기">←</button>
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* 타이틀 블록 (hero) */}
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] leading-tight font-extrabold text-[#191d12]">{place.name}</h1>
          <span className="self-start px-3 py-1 rounded-full bg-[#F2FBDF] text-[#436400] text-xs font-medium">
            {CATEGORY_LABEL[place.category]}
          </span>
        </div>

        {/* 주소 */}
        <p className="flex items-center gap-1 text-gray-500 text-sm">
          <span aria-hidden>📍</span>{place.address}
        </p>

        {/* 혜택 카드 */}
        <div className="bg-[#F2FBDF] rounded-2xl p-4 flex flex-col gap-3">
          {place.discount_badge ? (
            <div className="flex flex-col gap-1">
              <p className="text-xs text-[#5A8A1A] font-medium">러닝 할인 혜택</p>
              <p className="text-3xl font-extrabold text-[#191d12] leading-tight">{place.discount_badge}</p>
              <div className="w-10 h-1 bg-[#A8E63D] rounded-full" />
            </div>
          ) : null}
          <div>
            <p className="text-xs text-gray-500 mb-1">{place.discount_badge ? '상세 혜택 조건' : '혜택'}</p>
            <Multiline text={place.discount_content} className={`text-gray-900 ${place.discount_badge ? 'text-sm' : 'font-semibold'}`} />
          </div>
          {place.auth_condition && (
            <div>
              <p className="text-xs text-gray-500 mb-1">인증 조건</p>
              <p className="text-sm text-gray-700">{place.auth_condition}</p>
            </div>
          )}
          {place.expired_at && (
            <p className="text-xs text-gray-400 text-right">{place.expired_at} 까지</p>
          )}
        </div>

        {/* 길찾기 버튼: DB 값이 있는 것만 노출. 둘 다 없으면 영역 숨김 */}
        {hasMapLinks && (
          <div className={`grid gap-3 ${kakaoUrl && naverUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {kakaoUrl && (
              <a
                href={kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-[#FEE500] text-[#191d12] font-medium py-3 rounded-xl text-center text-sm"
              >
                <span aria-hidden>🗺️</span>카카오맵
              </a>
            )}
            {naverUrl && (
              <a
                href={naverUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-[#03C75A] text-white font-medium py-3 rounded-xl text-center text-sm"
              >
                <span aria-hidden>🧭</span>네이버지도
              </a>
            )}
          </div>
        )}

        {/* 사진 엿보기 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#191d12]">사진 엿보기</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1 text-sm text-[#436400] font-medium disabled:opacity-50"
            >
              <span aria-hidden>📷</span>{uploading ? '업로드 중...' : '사진 추가'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          {photoError && <p className="text-xs text-red-500">{photoError}</p>}

          {photosLoading ? (
            <p className="text-xs text-gray-400">사진 불러오는 중...</p>
          ) : photos.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-gray-300 rounded-xl py-6 text-sm text-gray-400"
            >
              아직 사진이 없어요. 첫 사진을 올려보세요!
            </button>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {photos.map(photo => (
                <a
                  key={photo.id}
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <img
                    src={photo.url}
                    alt="장소 사진"
                    loading="lazy"
                    className="w-28 h-28 object-cover rounded-xl bg-gray-100"
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* 오류 신고 (보조) */}
        <button className="w-full border border-gray-200 text-gray-400 py-3 rounded-xl text-sm">
          혜택 종료 / 오류 신고
        </button>
      </div>
    </div>
  )
}
