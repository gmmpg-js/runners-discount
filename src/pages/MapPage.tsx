import { useState, useEffect, useRef, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { usePlaces } from '../hooks/usePlaces'
import type { Place } from '../types'
import { CATEGORY_CONFIG, summarizeDiscount } from '../lib/markerUtils'
import { getCurrentPosition, LocationPermissionDeniedError } from '../lib/toss'

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'cafe', label: '카페' },
  { key: 'restaurant', label: '식당' },
  { key: 'dessert', label: '디저트' },
]

const RUNNING_SPOTS = [
  { label: '올림픽공원', lat: 37.5209, lng: 127.1220 },
  { label: '여의도공원', lat: 37.5260, lng: 126.9326 },
  { label: '남산', lat: 37.5512, lng: 126.9882 },
  { label: '반포종합운동장', lat: 37.5025, lng: 127.0005 },
  { label: '연세대', lat: 37.5665, lng: 126.9388 },
  { label: '한양대', lat: 37.5553, lng: 127.0454 },
  { label: '서울숲', lat: 37.5444, lng: 127.0374 },
  { label: '일자산', lat: 37.5545, lng: 127.1560 },
  { label: '하남종합운동장', lat: 37.5378, lng: 127.2098 },
  { label: '인천대공원', lat: 37.4447, lng: 126.7384 },
  { label: '하늘공원', lat: 37.5703, lng: 126.8815 },
]


declare global {
  interface Window { kakao: any }
}

export default function MapPage() {
  const navigate = useNavigate()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [category, setCategory] = useState('all')
  const [userPos, setUserPos] = useState({ lat: 37.5209, lng: 127.1220 }) // 올림픽공원 기본
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const { places } = usePlaces(userPos.lat, userPos.lng, category)

  useEffect(() => {
    getCurrentPosition()
      .then(pos => setUserPos(pos))
      .catch(() => { /* 위치 권한 거부 시 기본 위치(올림픽공원) 유지 */ })
  }, [])

  useEffect(() => {
    const key = import.meta.env.VITE_KAKAO_MAP_KEY
    if (!key || !mapRef.current) return

    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(userPos.lat, userPos.lng),
          level: 5,
        })
        mapInstanceRef.current = map
        setMapLoaded(true)
      })
    }
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !window.kakao || places.length === 0) return

    // 기존 오버레이 제거
    markersRef.current.forEach(o => o.overlay.setMap(null))
    markersRef.current = []

    places.forEach(place => {
      const config = CATEGORY_CONFIG[place.category] || { icon: '📍', color: '#A8E63D', label: '' }
      const summary = summarizeDiscount(place.discount_badge, place.discount_content)

      const content = document.createElement('div')
      content.className = 'rd-marker'
      content.innerHTML = `
        <div class="rd-bubble">
          <span class="rd-icon" style="background:${config.color}">${config.icon}</span>
          <span class="rd-discount">${summary}</span>
        </div>
        <div class="rd-tail"></div>
      `
      content.addEventListener('click', () => setSelectedPlace(place))

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(place.lat, place.lng),
        content,
        yAnchor: 1.15,
        clickable: true,
      })
      overlay.setMap(map)
      markersRef.current.push({ overlay, content, id: place.id })
    })

    // 줌 레벨에 따라 텍스트 토글
    const toggleCollapsed = () => {
      const collapsed = map.getLevel() >= 6
      markersRef.current.forEach(({ content }) => {
        content.classList.toggle('rd-collapsed', collapsed)
      })
    }
    window.kakao.maps.event.addListener(map, 'zoom_changed', toggleCollapsed)
    toggleCollapsed()

    return () => {
      window.kakao.maps.event.removeListener(map, 'zoom_changed', toggleCollapsed)
    }
  }, [places, mapLoaded])

  useEffect(() => {
    markersRef.current.forEach(({ content, id }) => {
      content.classList.toggle('selected', selectedPlace?.id === id)
    })
  }, [selectedPlace])

  const moveToSpot = (lat: number, lng: number) => {
    setUserPos({ lat, lng })
    mapInstanceRef.current?.setCenter(new window.kakao.maps.LatLng(lat, lng))
    mapInstanceRef.current?.setLevel(6)
  }

  const moveToCurrentPos = () => {
    getCurrentPosition()
      .then(newPos => {
        setUserPos(newPos)
        const map = mapInstanceRef.current
        if (map && window.kakao?.maps) {
          map.setCenter(new window.kakao.maps.LatLng(newPos.lat, newPos.lng))
          map.setLevel(4)
        }
      })
      .catch(err => {
        if (err instanceof LocationPermissionDeniedError) {
          alert('위치 권한이 거부되었습니다. 설정에서 위치 접근을 허용해주세요.')
        } else {
          alert('위치를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.')
        }
      })
  }

  return (
    <div className="max-w-[430px] mx-auto relative h-screen bg-gray-100 overflow-hidden">
      <Helmet>
        <title>러너스 디스카운트 — 러닝 후 할인받는 카페·식당 지도</title>
        <meta name="description" content="서울·수도권 러너를 위한 할인 카페·식당 지도. 러닝 인증 후 할인받을 수 있는 110개 이상의 매장을 지도에서 찾아보세요." />
        <meta property="og:title" content="러너스 디스카운트 — 러닝 후 할인받는 곳" />
        <meta property="og:description" content="러닝 기록 인증 시 할인받을 수 있는 카페·식당 지도 서비스" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      {/* 지도 영역 — h-screen 전체 차지 */}
      <div className="relative h-screen">
        {import.meta.env.VITE_KAKAO_MAP_KEY ? (
          <div ref={mapRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center gap-2">
            <div className="text-4xl">🗺️</div>
            <p className="text-gray-500 text-sm">카카오맵 API 키를 설정해주세요</p>
            <div className="flex flex-col gap-1 mt-2">
              {places.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlace(p)}
                  className="bg-white rounded-xl px-3 py-2 text-left text-sm shadow hover:bg-lime-light"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-gray-400 ml-2 text-xs">{p.discount_content}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 현위치 버튼 — 필터 아래로 위치 조정 */}
        <button
          onClick={moveToCurrentPos}
          className="absolute z-10 bg-white rounded-full w-10 h-10 shadow flex items-center justify-center text-lg"
          style={{ top: '152px', right: '16px' }}
        >
          📍
        </button>
      </div>

      {/* 네비바 */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-white/70 backdrop-blur-sm">
        <span className="font-extrabold text-gray-900 text-lg tracking-tight">Runner's Discount</span>
      </div>

      {/* 필터 칩 — 네비바 바로 아래 */}
      <div
        className="absolute left-0 right-0 z-10 flex gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm overflow-x-auto no-scrollbar"
        style={{ top: '52px' }}
      >
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              category === c.key
                ? 'bg-[#A8E63D] text-gray-900'
                : 'bg-white/80 text-gray-600 border border-gray-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 러닝 성지 칩 */}
      <div
        className="absolute left-0 right-0 z-10 flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar"
        style={{ top: '96px' }}
      >
        {RUNNING_SPOTS.map(spot => (
          <button
            key={spot.label}
            onClick={() => moveToSpot(spot.lat, spot.lng)}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-gray-900/80 text-white backdrop-blur-sm"
          >
            <span>🏃</span>
            {spot.label}
          </button>
        ))}
      </div>

      {/* 바텀시트 */}
      {selectedPlace && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-2xl shadow-lg px-4 pt-4 pb-6">
          <div className="w-10 h-1 bg-gray-200 rounded mx-auto mb-3" />
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                {CATEGORY_CONFIG[selectedPlace.category]?.label ?? selectedPlace.category}
              </span>
              <h3 className="font-semibold text-gray-900 mt-1">{selectedPlace.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{selectedPlace.address}</p>
              {selectedPlace.discount_badge ? (
                <>
                  <p className="text-xl font-bold text-[#A8E63D] mt-2 leading-tight">{selectedPlace.discount_badge}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-3">
                    {selectedPlace.discount_content.split('\n').map((line, i) => (
                      <Fragment key={i}>{i > 0 && <br />}{line}</Fragment>
                    ))}
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium text-gray-700 mt-2">{selectedPlace.discount_content}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedPlace(null)}
              className="text-gray-400 ml-2"
            >
              ✕
            </button>
          </div>
          <button
            onClick={() => navigate(`/place/${selectedPlace.id}`)}
            className="mt-3 w-full bg-[#A8E63D] text-gray-900 font-medium py-2.5 rounded-xl text-sm"
          >
            자세히 보기
          </button>
        </div>
      )}

      {/* FAB — 바텀시트 열려 있으면 숨김 */}
      {!selectedPlace && (
        <button
          onClick={() => navigate('/submit')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-[#A8E63D] text-gray-900 font-semibold px-6 py-3 rounded-full shadow-lg text-sm flex items-center gap-2 whitespace-nowrap"
        >
          <span>📍</span>
          <span>장소 제보하기</span>
        </button>
      )}
    </div>
  )
}
