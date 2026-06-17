import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  { key: 'cafe', label: '카페' },
  { key: 'restaurant', label: '식당' },
  { key: 'dessert', label: '디저트' },
]

interface KakaoPlace { place_name: string; address_name: string; x: string; y: string }

export default function SubmitPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [category, setCategory] = useState('cafe')
  const [discount, setDiscount] = useState('')
  const [authCondition, setAuthCondition] = useState('')
  const [expiredAt, setExpiredAt] = useState('')
  const [suggestions, setSuggestions] = useState<KakaoPlace[]>([])
  const [mapUrl, setMapUrl] = useState('')
  const [naverMapUrl, setNaverMapUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const searchPlace = async (query: string) => {
    setName(query)
    const restKey = import.meta.env.VITE_KAKAO_REST_KEY
    if (!restKey || query.length < 2) { setSuggestions([]); return }
    const res = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`, {
      headers: { Authorization: `KakaoAK ${restKey}` }
    })
    const data = await res.json()
    setSuggestions(data.documents || [])
  }

  const selectPlace = (p: KakaoPlace) => {
    setName(p.place_name)
    setAddress(p.address_name)
    setLat(parseFloat(p.y))
    setLng(parseFloat(p.x))
    setSuggestions([])
  }

  const handleSubmit = async () => {
    if (!name || !address || !discount) return
    setSubmitting(true)

    // 좌표가 없으면 카카오 API로 주소 → 좌표 변환
    let finalLat = lat
    let finalLng = lng
    if (finalLat === null || finalLng === null) {
      const restKey = import.meta.env.VITE_KAKAO_REST_KEY
      if (restKey) {
        const res = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`, {
          headers: { Authorization: `KakaoAK ${restKey}` }
        })
        const data = await res.json()
        if (data.documents?.[0]) {
          finalLat = parseFloat(data.documents[0].y)
          finalLng = parseFloat(data.documents[0].x)
        }
      }
    }

    if (finalLat === null || finalLng === null) {
      alert('주소로 위치를 찾을 수 없습니다. 검색창에서 장소를 선택해주세요.')
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('places').insert({
      name,
      address,
      location: `SRID=4326;POINT(${finalLng} ${finalLat})`,
      lat: finalLat,
      lng: finalLng,
      category,
      discount_content: discount,
      auth_condition: authCondition || null,
      expired_at: expiredAt || null,
      map_url: mapUrl || null,
      naver_map_url: naverMapUrl || null,
      status: 'pending',
    })

    setSubmitting(false)
    if (error) {
      console.error('[SubmitPage] insert error:', error)
      alert('오류가 발생했습니다. 다시 시도해주세요.')
      return
    }
    alert('제보 완료! 검토 후 지도에 표시됩니다.')
    navigate('/')
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-white">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="text-gray-600 text-lg">←</button>
        <h1 className="font-semibold text-gray-900">새 장소 제보하기</h1>
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* 상호명 */}
        <div className="relative">
          <label className="text-xs text-gray-500 mb-1 block">상호명 *</label>
          <input
            value={name}
            onChange={e => searchPlace(e.target.value)}
            placeholder="가게 이름을 입력하세요"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#A8E63D]"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => selectPlace(s)} className="w-full text-left px-3 py-2 text-sm hover:bg-lime-light border-b border-gray-100 last:border-0">
                  <p className="font-medium">{s.place_name}</p>
                  <p className="text-xs text-gray-400">{s.address_name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 주소 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">주소 *</label>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="주소를 입력하세요"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#A8E63D]"
          />
        </div>

        {/* 카테고리 */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">카테고리 *</label>
          <div className="flex gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === c.key ? 'bg-[#A8E63D] text-gray-900' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* 할인 내용 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">할인 내용 *</label>
          <textarea
            value={discount}
            onChange={e => setDiscount(e.target.value)}
            placeholder="예: 아메리카노 500원 할인, 런치 10% 할인"
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#A8E63D] resize-none"
          />
        </div>

        {/* 인증 조건 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">인증 조건 (선택)</label>
          <input
            value={authCondition}
            onChange={e => setAuthCondition(e.target.value)}
            placeholder="예: 런닝복 착용, Strava 인증"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#A8E63D]"
          />
        </div>

        {/* 만료일 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">혜택 만료일 (선택)</label>
          <input
            type="date"
            value={expiredAt}
            onChange={e => setExpiredAt(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#A8E63D]"
          />
        </div>

        {/* 지도 URL */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">카카오맵 URL (선택)</label>
          <input
            value={mapUrl}
            onChange={e => setMapUrl(e.target.value)}
            placeholder="http://place.map.kakao.com/..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#A8E63D]"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">네이버지도 URL (선택)</label>
          <input
            value={naverMapUrl}
            onChange={e => setNaverMapUrl(e.target.value)}
            placeholder="https://naver.me/..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#A8E63D]"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !name || !address || !discount}
          className="w-full bg-[#A8E63D] text-gray-900 font-semibold py-3 rounded-xl text-sm disabled:opacity-40"
        >
          {submitting ? '제보 중...' : '제보하기'}
        </button>

        <p className="text-center text-xs text-gray-400">로그인 없이 제보 가능합니다</p>
      </div>
    </div>
  )
}
