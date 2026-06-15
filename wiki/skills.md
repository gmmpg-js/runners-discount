# skills — Runner's Discount Claude 모바일 스킬

Claude 모바일 앱에서 `/명령어`로 실행. 파일 위치: `~/.claude/commands/`

## /add-place
새 장소 등록. `~/.claude/commands/add-place.md`

**입력 항목**
1. 상호명 (필수)
2. 주소 (필수) → Kakao API로 좌표 자동 변환
3. 카테고리: `cafe` / `restaurant` / `dessert`
4. 할인 내용 (필수)
5. 인증 조건 (선택)
6. 만료일 YYYY-MM-DD (선택)
7. 카카오맵 URL (선택) — `kko.to/` 단축 URL 자동 파싱
8. 네이버지도 URL (선택)

**동작**
- 카카오 단축 URL → `curl -sI` 로 redirect → `itemId` 추출 → `place.map.kakao.com/ID`
- Supabase INSERT (`status: pending`)

## /list-places
목록 조회. `~/.claude/commands/list-places.md`

```
/list-places             → approved 전체
/list-places pending     → 검토 대기
/list-places 카페        → 카테고리 필터
/list-places 강남        → 주소 지역 검색
```

출력 형식: 이름 / 주소 / 할인 / 인증 조건 / 카카오·네이버 URL / ID

## /update-place
장소 정보 수정. `~/.claude/commands/update-place.md`

```
/update-place [UUID]
```

수정 가능 필드:
`name` / `address` / `category` / `discount_content` / `auth_condition` / `expired_at` / `map_url` / `naver_map_url` / `status`

특수 명령: `/update-place approve-all` → 모든 pending → approved

## 환경변수 (settings.json)
```json
{
  "env": {
    "SUPABASE_URL": "...",
    "SUPABASE_ANON_KEY": "...",
    "KAKAO_REST_KEY": "..."
  }
}
```

관련: [[data-model.md]] [[architecture.md]]
