# architecture — Runner's Discount

## 화면 구조

```
/ (MapPage)
  ├── 네비바: "Runner's Discount" (반투명 overlay)
  ├── 필터 칩: 전체/카페/식당/디저트 (반투명 overlay)
  ├── 지도: Kakao Maps (h-screen 전체)
  │   └── CustomOverlay 마커: 카테고리 아이콘 + 할인 요약 말풍선
  ├── 바텀시트: 선택된 장소 요약 (absolute bottom)
  └── FAB: "📍 장소 제보하기" (pill, 라임그린, 하단 중앙)

/place/:id (PlaceDetailPage)
  ├── 헤더: ← 뒤로가기
  ├── 매장명 hero (text-[28px] font-extrabold)
  ├── 카테고리 칩
  ├── 주소
  ├── 혜택 카드 (bg-[#F2FBDF])
  ├── 사진 갤러리 + 업로드 버튼
  └── 길찾기 버튼 (카카오맵 / 네이버지도 — DB 값 있을 때만 노출)

/submit (SubmitPage)
  ├── 상호명 검색 (Kakao 키워드 API 자동완성)
  ├── 주소 (자동완성 또는 직접 입력)
  ├── 카테고리 선택
  ├── 할인 내용
  ├── 인증 조건 (선택)
  └── 만료일 (선택)
```

## 지도 마커 동작
- 기본: `kakao.maps.CustomOverlay` (말풍선형)
- 줌 레벨 ≥ 6: 텍스트 숨김, 아이콘 핀만 (`.rd-collapsed`)
- 클릭: `setSelectedPlace()` → 바텀시트 표시
- 선택 마커: `.selected` 클래스 토글 (라임그린 강조)
- 기본 중심: 올림픽공원 (37.5209, 127.1220), zoom level 5

## 데이터 흐름
```
사용자 제보(SubmitPage)
  → Kakao API 좌표 변환
  → Supabase INSERT (status: pending)
  → /list-places pending 으로 검토
  → /update-place approved → 지도 노출

지도 로드(MapPage)
  → usePlaces() → Supabase SELECT (status: approved)
  → CustomOverlay 생성 → 지도 렌더링
```

## Supabase 연동
- 클라이언트: `src/lib/supabase.ts`
- 환경변수: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- 쿼리: `select *` (geography 컬럼은 WKB로 반환되나 lat/lng 컬럼 별도 사용)

## 알려진 이슈 및 해결 이력
| 이슈 | 원인 | 해결 |
|------|------|------|
| 마커 미표시 | Kakao SDK 비동기 로드 race condition | `mapLoaded` state + `[places, mapLoaded]` 의존성 |
| 제보 silent fail | `!VITE_SUPABASE_URL` mock 분기 항상 실행 | mock 분기 제거 |
| 제보 RLS 차단 | INSERT 정책 누락 | `WITH CHECK (true)` 정책 추가 |
| SELECT 제한 | `status=approved`만 허용 정책 | `USING (true)` 로 전체 허용 |

관련: [[data-model.md]] [[skills.md]]
