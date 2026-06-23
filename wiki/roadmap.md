# roadmap — Runner's Discount

## 완료된 작업

### 인프라
- [x] Supabase 프로젝트 연동 (URL, anon key, Kakao REST key)
- [x] PostGIS 확장 + places 테이블 + lat/lng 컬럼
- [x] place_photos 테이블 + Storage 버킷 `place-photos`
- [x] RLS 정책: SELECT/INSERT/UPDATE/DELETE 전체 허용

### 지도 화면 (MapPage)
- [x] Kakao Maps 렌더링 (기본 중심: 올림픽공원, zoom 5)
- [x] CustomOverlay 말풍선 마커 (카테고리 아이콘 + 할인 요약)
- [x] 줌 레벨 기반 마커 텍스트 토글 (≥6 접힘)
- [x] 선택 마커 강조 (.selected)
- [x] 카테고리 필터 칩 (반투명 overlay)
- [x] 반투명 네비바 ("Runner's Discount")
- [x] "📍 장소 제보하기" pill FAB
- [x] 현위치 이동 버튼

### 장소 상세 (PlaceDetailPage)
- [x] 매장명 hero 강조 (text-[28px] font-extrabold)
- [x] 카카오맵 / 네이버지도 분리 버튼 (DB 값 있을 때만 노출)
- [x] 사진 갤러리 + 업로드 버튼 (Supabase Storage)

### 장소 제보 (SubmitPage)
- [x] Kakao 키워드 자동완성 + 좌표 자동 추출
- [x] 주소 직접 입력 시 좌표 fallback 조회
- [x] 제보 후 pending 상태로 저장

### Claude 스킬
- [x] /add-place (카카오 단축 URL 파싱, map_url, naver_map_url 포함)
- [x] /list-places (status/카테고리/지역 필터)
- [x] /update-place (map_url, naver_map_url 수정 가능)

### 데이터
- [x] 110곳 approved (서울/수도권/부산/대구/광주/대전/울산/제주/강원/충청/전라/경북)
- [x] discount_badge / discount_rate / discount_rules / image_url 컬럼 추가 (migration.sql)
- [x] places_data.json (39곳) + places_data_2.json (71곳) upsert 완료

### SEO / GTM
- [x] react-helmet-async — 페이지별 meta/OG 태그
- [x] JSON-LD LocalBusiness 구조화 데이터 (상세 페이지)
- [x] robots.txt — AI 봇 명시 허용
- [x] llms.txt — AI 검색 노출용 매장 목록

### 토스 미니앱
- [x] @apps-in-toss/web-framework SDK 2.x 설치 (기존 Vite 프로젝트 in-place 전환)
- [x] granite.config.ts 작성 (appName, brand, geolocation 권한)
- [x] 카카오맵 WebView 렌더링 확인 (도메인 등록: runners-discount.private-apps.tossmini.com)
- [x] 토스 SDK geolocation API 연동 (src/lib/toss.ts)
- [x] 외부 링크 openExternalURL 전환 (길찾기 버튼)
- [x] .ait 빌드 성공 및 콘솔 업로드, 검수 요청
- [x] Supabase CORS 동작 확인 (anon key 직접 쿼리 방식으로 별도 설정 불필요)

## 진행 예정

### 단기
- [ ] 러닝지 필터 — 한강/올림픽공원/남산 등 선택 시 지도 이동
- [ ] 어드민 페이지 — pending 목록 + 승인/거절 버튼

### 중기
- [ ] 사진 상세보기 (갤러리 전체화면)
- [ ] 장소 공유 기능
- [ ] 오류 신고 기능 구현 (현재 버튼만 존재)

관련: [[architecture.md]] [[data-model.md]] [[skills.md]]
