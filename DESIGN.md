# DESIGN.md — PlaceDetailPage 개선

## 개요
Runner's Discount 자세히 보기 화면. 매장명 hero 강조 + 카카오맵/네이버지도 분리 길찾기.

- Stitch 프로젝트: RunnerSpot — 러너 할인 지도 (`12469200457540580819`)
- Stitch 화면 ID: `81bf86c3031e44cda13c5fa4b949d601`
- 디바이스: MOBILE, max-width 430px, 라이트 테마

## 레이아웃 (위→아래)
1. **헤더**: ← 뒤로가기. 컴팩트, 흰 배경, 하단 1px divider. (큰 타이틀 없음)
2. **타이틀 블록 (hero)**: 매장명 `text-[28px] font-extrabold text-[#191d12]`. 바로 아래 카테고리 칩(pill, 라임 틴트 bg `#F2FBDF`, 텍스트 `#436400`).
3. **주소**: 위치핀 아이콘 + 회색 본문 `text-sm text-gray-500`.
4. **혜택 카드**: `rounded-2xl bg-[#F2FBDF] p-4`. 라벨/값 스택 — 혜택(라벨 + bold 값) / 인증 조건(라벨 + 값) / 만료일(muted `2026-12-31 까지`).
5. **길찾기 버튼 (1:1 가로 분할)**:
   - 카카오맵: bg `#FEE500`, 텍스트 `#191d12`(검정), 핀/방향 아이콘
   - 네이버지도: bg `#03C75A`, 텍스트 흰색, 방향 아이콘
   - 동일 너비, `rounded-xl`, `gap-3`, 둘 다 항상 노출
6. **오류 신고**: 보조 outlined 버튼 `border-gray-200 text-gray-400`, "혜택 종료 / 오류 신고".

## 구현 범위 제외 (디자이너 자체 추가분, MVP 미포함)
- 지도 미리보기 썸네일
- 매장 내부 사진 갤러리("공간 엿보기")

## 토큰
| 용도 | 값 |
|------|-----|
| 매장명 텍스트 | #191d12 |
| 혜택 카드 / 칩 bg | #F2FBDF |
| 칩 텍스트 | #436400 |
| 카카오맵 버튼 | bg #FEE500 / 텍스트 #191d12 |
| 네이버지도 버튼 | bg #03C75A / 텍스트 #FFFFFF |
| 브랜드 라임 | #A8E63D |

---

# DESIGN.md — MapPage UI 개선

## 개요
Runner's Discount 지도 메인 화면. 지도가 전체 화면을 채우고, 네비바·필터 칩·FAB이 지도 위에 overlay로 떠 있는 구조.

- Stitch 프로젝트: RunnerSpot — 러너 할인 지도 (`12469200457540580819`)
- Stitch 화면 ID: `70ce0deec8704ee49c8244a9382f8271`
- 화면명: Runner's Discount 지도 홈 (플로팅 UI)
- 디바이스: MOBILE, max-width 430px, 라이트 테마

## 레이아웃 (z-index 레이어 구조)

### Layer 0 — 지도 배경 (z-index: 0)
- 지도가 전체 화면을 차지 (100vw × 100vh)
- 서울 강남구 지역, 도로·블록·공원 포함, 소프트 뮤트 컬러
- 지도 핀 3개:
  - 라임 그린 원형 핀 (#A8E63D) + 커피컵 아이콘 + "카페 블루밍" 말풍선 툴팁
  - 라임 그린 원형 핀 + 식당 아이콘
  - 라임 그린 원형 핀 + 케이크 아이콘

### Layer 1 — 네비바 (position: absolute, top: 0, z-index: 10)
- 높이: 52px
- 배경: `rgba(255,255,255,0.70)` + `backdrop-filter: blur(12px)` (frosted glass)
- 텍스트: "Runner's Discount"
  - 폰트: Plus Jakarta Sans 18px font-weight:700, 색상 #191d12
- 좌우 패딩: 20px
- 하단 구분선: `1px solid rgba(0,0,0,0.06)`

### Layer 2 — 필터 칩 바 (position: absolute, 네비바 바로 아래, z-index: 10)
- 배경: `rgba(255,255,255,0.80)` + `backdrop-filter: blur(8px)`
- 세로 패딩: 10px, 좌우 패딩: 16px
- 수평 스크롤 가능 (overflow-x: auto)
- 칩 4개: [전체] [카페] [식당] [디저트]
  - 선택(active) — 전체: bg #A8E63D, 텍스트 #191d12, font-weight: 700
  - 미선택(inactive): bg rgba(255,255,255,0.90), border 1px solid #e0e3d8, 텍스트 #424936
  - 공통: border-radius 9999px, 높이 34px, 좌우 패딩 14px, 칩 간격 8px
  - 폰트: Be Vietnam Pro 14px font-weight:600

### Layer 3 — FAB (position: absolute, bottom: 32px, 중앙, z-index: 20)
- 형태: pill (border-radius: 9999px)
- 라벨: "📍 장소 제보하기"
- 배경: #A8E63D
- 텍스트: #191d12, Plus Jakarta Sans 15px font-weight:700
- 높이: 48px, 좌우 패딩: 24px
- 그림자: `0px 4px 16px rgba(0,0,0,0.18)`
- 하단 내비게이션 바 없음

## 토큰
| 용도 | 값 |
|------|-----|
| 브랜드 라임 | #A8E63D |
| 텍스트 기본 | #191d12 |
| 텍스트 보조 | #424936 |
| 네비바 배경 | rgba(255,255,255,0.70) |
| 필터 바 배경 | rgba(255,255,255,0.80) |
| 비활성 칩 테두리 | #e0e3d8 |
| FAB 그림자 | 0px 4px 16px rgba(0,0,0,0.18) |
