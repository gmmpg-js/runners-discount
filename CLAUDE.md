# CLAUDE.md — Runner's Discount

Runner's 할인 매장을 지도에서 탐색하는 모바일 웹앱.
이 파일은 프로젝트 컨벤션과 워크플로우를 정의한다. Wiki 페이지들은 `wiki/` 폴더에 있다.

## 기술 스택
- **Frontend**: React 18 + TypeScript + Vite
- **스타일**: Tailwind CSS (테마 컬러: `#A8E63D` 라임그린)
- **지도**: Kakao Maps JS SDK (`CustomOverlay` 기반 마커)
- **DB/Storage**: Supabase (PostgreSQL + PostGIS + Storage)
- **Node**: v20+ 필수 (`nvm use 20.20.2`)

## 프로젝트 구조
```
src/
  pages/
    MapPage.tsx        — 메인 지도 화면
    PlaceDetailPage.tsx — 장소 상세
    SubmitPage.tsx     — 장소 제보 폼
  hooks/
    usePlaces.ts       — 장소 목록 조회
    usePlacePhotos.ts  — 사진 조회/업로드
  lib/
    supabase.ts        — Supabase 클라이언트
    markerUtils.ts     — 카테고리 설정, 할인 요약 함수
  types.ts             — Place 타입 정의
wiki/                  — 프로젝트 지식 베이스
schema.sql             — DB 스키마 전체
DESIGN.md              — 디자인 스펙 (Stitch 연동)
```

## 환경변수 (.env)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_KAKAO_MAP_KEY      # 지도 렌더링용
VITE_KAKAO_REST_KEY     # 주소→좌표 변환, 키워드 검색
```

## 개발 실행
```bash
source ~/.nvm/nvm.sh && nvm use 20.20.2
cd ~/runners-discount
npm run dev
```

## 장소 데이터 관리
Claude 모바일 스킬로 관리. 자세한 내용 → [[wiki/skills.md]]
- `/add-place` — 새 장소 등록 (pending)
- `/list-places [pending|카페|지역]` — 목록 조회
- `/update-place [ID]` — 정보 수정 / 상태 변경

## 승인 워크플로우
1. 사용자 앱 제보 or `/add-place` → `status: pending`
2. `/list-places pending` 으로 검토
3. `/update-place [ID]` → `status: approved` → 지도 노출

## 코딩 컨벤션
- 컴포넌트: 함수형 + hooks
- 스타일: Tailwind 인라인 (CSS 파일은 커스텀 클래스만 `index.css`)
- 마커: `kakao.maps.CustomOverlay` + `.rd-*` CSS 클래스
- 새 기능 추가 시: PM → Designer → Developer 순서
