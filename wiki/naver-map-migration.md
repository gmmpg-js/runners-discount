# 네이버지도 전환 가이드

카카오맵 JS SDK가 토스 미니앱 WebView에서 동작하지 않을 경우를 대비한 네이버지도 JS API v3 전환 가이드.

## 현재 코드 구조

```
src/
  pages/MapPage.tsx      — 카카오맵 SDK 동적 로드, CustomOverlay 기반 마커
  lib/markerUtils.ts     — CATEGORY_CONFIG, summarizeDiscount 유틸
```

### 카카오맵 핵심 패턴 (MapPage.tsx)

| 역할 | 카카오맵 API |
|------|-------------|
| 지도 초기화 | `new kakao.maps.Map(el, { center, level })` |
| 좌표 생성 | `new kakao.maps.LatLng(lat, lng)` |
| 커스텀 마커 | `new kakao.maps.CustomOverlay({ position, content, yAnchor })` |
| 마커 표시/제거 | `overlay.setMap(map)` / `overlay.setMap(null)` |
| 지도 이동 | `map.setCenter(latLng)` |
| 줌 변경 이벤트 | `kakao.maps.event.addListener(map, 'zoom_changed', fn)` |
| 이벤트 제거 | `kakao.maps.event.removeListener(map, 'zoom_changed', fn)` |
| 줌 레벨 조회 | `map.getLevel()` |

---

## 단계별 전환 가이드

### Step 1. 네이버 개발자센터 설정

1. https://console.ncloud.com 에서 Maps API 애플리케이션 등록
2. 허용 도메인 추가:
   - `localhost`
   - `runners-discount.vercel.app`
   - `*.apps.tossmini.com`
   - `*.private-apps.tossmini.com`
3. Client ID 발급 → 환경변수에 저장

### Step 2. 환경변수 변경

`.env` 수정:
```diff
- VITE_KAKAO_MAP_KEY=...
- VITE_KAKAO_REST_KEY=...
+ VITE_NAVER_MAP_CLIENT_ID=...
```

`VITE_KAKAO_REST_KEY`는 주소→좌표 변환(Geocoding)에 사용 중. 네이버 Geocoding API로 대체하거나 Supabase에 lat/lng가 이미 저장되어 있으면 제거 가능.

### Step 3. SDK 동적 로드 교체 (MapPage.tsx)

```tsx
// 기존 카카오맵 스크립트 로드
const script = document.createElement('script')
script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`
script.onload = () => {
  window.kakao.maps.load(() => { /* 초기화 */ })
}

// 네이버지도로 교체
const script = document.createElement('script')
script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`
script.onload = () => {
  /* naver.maps 바로 사용 가능 — autoload 없음 */
  initMap()
}
```

Window 타입 선언 변경:
```tsx
// 기존
declare global { interface Window { kakao: any } }

// 변경
declare global { interface Window { naver: any } }
```

### Step 4. 지도 초기화 교체

```tsx
// 기존
const map = new window.kakao.maps.Map(mapRef.current, {
  center: new window.kakao.maps.LatLng(userPos.lat, userPos.lng),
  level: 5,
})

// 네이버지도
const map = new window.naver.maps.Map(mapRef.current, {
  center: new window.naver.maps.LatLng(userPos.lat, userPos.lng),
  zoom: 14,  // 카카오 level 5 ≈ 네이버 zoom 14
})
```

카카오 level과 네이버 zoom 대응 참고값:

| 카카오 level | 네이버 zoom | 대략 범위 |
|-------------|------------|---------|
| 4 | 15 | 500m |
| 5 | 14 | 1km |
| 6 | 13 | 2km |

### Step 5. CustomOverlay → 네이버 Marker + InfoWindow

네이버지도는 HTML 콘텐츠를 직접 삽입하는 `CustomOverlay`가 없습니다. 두 가지 방법이 있습니다.

**방법 A: naver.maps.Marker + icon.content (HTML 마커) — 권장**

카카오 `CustomOverlay`와 가장 유사한 방식입니다.

```tsx
// 기존 카카오 CustomOverlay
const content = document.createElement('div')
content.className = 'rd-marker'
content.innerHTML = `<div class="rd-bubble">...</div>`
const overlay = new window.kakao.maps.CustomOverlay({
  position: new window.kakao.maps.LatLng(place.lat, place.lng),
  content,
  yAnchor: 1.15,
  clickable: true,
})
overlay.setMap(map)

// 네이버지도 Marker (HTML icon)
const marker = new window.naver.maps.Marker({
  position: new window.naver.maps.LatLng(place.lat, place.lng),
  map,
  icon: {
    content: `
      <div class="rd-marker">
        <div class="rd-bubble">
          <span class="rd-icon" style="background:${config.color}">${config.icon}</span>
          <span class="rd-discount">${summary}</span>
        </div>
        <div class="rd-tail"></div>
      </div>
    `,
    anchor: new window.naver.maps.Point(0, 0),  // yAnchor 대체
  },
})
```

클릭 이벤트:
```tsx
// 기존: content.addEventListener('click', ...)

// 네이버지도
window.naver.maps.Event.addListener(marker, 'click', () => setSelectedPlace(place))
```

마커 제거:
```tsx
// 기존: overlay.setMap(null)

// 네이버지도
marker.setMap(null)
```

**방법 B: naver.maps.Marker + InfoWindow (정보창)**

마커 클릭 시 바텀시트로 처리하는 현재 구조에서는 불필요합니다.

### Step 6. 줌 이벤트 교체

```tsx
// 기존
window.kakao.maps.event.addListener(map, 'zoom_changed', toggleCollapsed)
window.kakao.maps.event.removeListener(map, 'zoom_changed', toggleCollapsed)
const collapsed = map.getLevel() >= 6

// 네이버지도
const listener = window.naver.maps.Event.addListener(map, 'zoom_changed', toggleCollapsed)
window.naver.maps.Event.removeListener(listener)  // listener 객체를 저장해야 함
const collapsed = map.getZoom() <= 13
```

`removeListener`에 함수 레퍼런스가 아닌 addListener 반환값을 사용하므로, ref에 저장 필요:
```tsx
const zoomListenerRef = useRef<any>(null)

// 등록 시
zoomListenerRef.current = window.naver.maps.Event.addListener(map, 'zoom_changed', toggleCollapsed)

// 해제 시 (useEffect cleanup)
if (zoomListenerRef.current) {
  window.naver.maps.Event.removeListener(zoomListenerRef.current)
}
```

### Step 7. 지도 이동 교체

```tsx
// 기존
map.setCenter(new window.kakao.maps.LatLng(lat, lng))
map.setLevel(6)

// 네이버지도
map.setCenter(new window.naver.maps.LatLng(lat, lng))
map.setZoom(13)
```

### Step 8. markerUtils.ts

변경 불필요. `CATEGORY_CONFIG`와 `summarizeDiscount`는 지도 SDK에 무관합니다.

---

## 카카오 도메인 화이트리스트 (CEO 직접 등록 필요)

토스 미니앱에서 카카오맵 JS SDK를 사용하려면 카카오 개발자센터(https://developers.kakao.com)에서 해당 앱의 **플랫폼 → Web → 사이트 도메인**에 아래 도메인을 등록해야 합니다.

| 도메인 | 용도 |
|--------|------|
| `https://*.apps.tossmini.com` | 토스 미니앱 프로덕션 WebView |
| `https://*.private-apps.tossmini.com` | 토스 미니앱 스테이징/개발 WebView |
| `http://localhost:5173` | 로컬 개발 (이미 등록되어 있을 수 있음) |

> 와일드카드(`*`) 서브도메인이 카카오 개발자센터에서 허용되는지 확인 필요. 허용되지 않으면 토스로부터 실제 도메인 목록을 받아서 개별 등록해야 합니다.

---

## 의사결정 기준

카카오맵을 계속 사용할지, 네이버지도로 전환할지 PoC 결과 기준:

| 확인 항목 | 판단 기준 |
|-----------|---------|
| 카카오 SDK 스크립트 로드 성공 | `script.onload` 실행 여부 |
| `kakao.maps.load()` 콜백 실행 | 지도 컨테이너 렌더링 여부 |
| CustomOverlay DOM 표시 | 마커 HTML이 지도 위에 표시되는지 |
| 위치 권한 동작 | `navigator.geolocation` 응답 여부 |

하나라도 실패 시 네이버지도 전환을 진행합니다.
