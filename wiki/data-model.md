# data-model — Runner's Discount

## places 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| name | text | 매장명 |
| address | text | 주소 |
| location | geography(Point,4326) | PostGIS 좌표 |
| lat | float | 위도 (마커 렌더링용) |
| lng | float | 경도 |
| category | text | `cafe` / `restaurant` / `dessert` / `food` / `other` / `sports` / `stay` |
| discount_content | text | 할인 내용 전체 설명 |
| discount_badge | text | 핵심 혜택 요약 ("최대 10%", "최대 1,000원" 등) — UI 메인 노출용 |
| discount_rate | int | 최대 할인율 (% 기준, 금액 할인은 NULL) |
| discount_rules | jsonb | 조건별 상세 혜택 배열 (benefit_type, condition 등) |
| image_url | text | 매장 대표 이미지 URL (선택) |
| auth_condition | text | 인증 조건 한국어 텍스트 (선택) |
| expired_at | text | 만료일 YYYY-MM-DD (선택) |
| map_url | text | 카카오맵 URL (`place.map.kakao.com/ID`) |
| naver_map_url | text | 네이버지도 URL |
| status | text | `pending` / `approved` / `rejected` |
| created_at | timestamptz | 생성일 |

## place_photos 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| place_id | uuid | FK → places.id (cascade delete) |
| storage_path | text | Supabase Storage 경로 |
| created_at | timestamptz | |

## Storage
- 버킷: `place-photos` (public)
- Public URL: `{SUPABASE_URL}/storage/v1/object/public/place-photos/{path}`

## RLS 정책
| 테이블 | 작업 | 정책 |
|--------|------|------|
| places | SELECT | 전체 허용 (anyone can read) |
| places | INSERT | 전체 허용 (status=pending으로 삽입) |
| places | UPDATE | 전체 허용 |
| places | DELETE | 전체 허용 |
| place_photos | SELECT | 전체 허용 |
| place_photos | INSERT | 전체 허용 |
| storage.objects | SELECT | bucket_id = 'place-photos' |
| storage.objects | INSERT | bucket_id = 'place-photos' |

## 카테고리 매핑
```ts
cafe       → ☕ 브라운 #8B5E3C
restaurant → 🍽️ 레드 #E5533D
dessert    → 🍰 핑크 #E67EA8
```

## 할인 요약 로직 (markerUtils.ts)
마커 말풍선에는 9자 이내로 요약 표시:
1. `%` 패턴 → "N% 할인"
2. "무료" 키워드 → "X 무료"
3. "km" 포함 → "km당 할인"
4. fallback → 앞 8자 + …

관련: [[architecture.md]] [[skills.md]]
