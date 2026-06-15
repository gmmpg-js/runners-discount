# GTM / SEO 전략 — Runner's Discount

배포 전후 검색 노출과 AI 검색(GEO) 대응을 위한 전략 정리.

## 배경
유사 서비스들이 GTM 전략 부재로 실패한 것으로 판단. SEO와 GPT/Gemini 등 AI 검색에서 발견될 수 있는 최소 장치를 배포 전에 확보한다.

---

## 완료된 SEO 작업

### 1. react-helmet-async — meta/OG 태그
- `main.tsx`에 `HelmetProvider` 추가
- `MapPage`: 서비스 전체 타이틀 + description + OG 태그
- `PlaceDetailPage`: 장소별 개별 타이틀 + description + JSON-LD LocalBusiness

### 2. JSON-LD 구조화 데이터 (LocalBusiness)
- 장소 상세 페이지에 `schema.org/LocalBusiness` 마크업 삽입
- name, address, geo(lat/lng), description 포함
- Google 리치 결과 트리거 가능

### 3. robots.txt
- 위치: `public/robots.txt`
- 모든 크롤러 허용 + GPTBot, PerplexityBot, ClaudeBot, Google-Extended 명시 허용
- Sitemap URL 등록

### 4. llms.txt (GEO — Generative Engine Optimization)
- 위치: `public/llms.txt`
- AI 크롤러(GPTBot, ClaudeBot 등)가 서비스 맥락 파악에 활용
- 전국 110개 매장 목록을 지역별로 정리해 수록
- 인증 방법, 서비스 소개 포함

---

## 남은 작업 (배포 후)

### 단기
- [ ] `sitemap.xml` 생성 — Supabase에서 approved 장소 ID 목록 쿼리해 빌드타임 생성
- [ ] `index.html` 기본 meta 태그 보강 (현재 Vite 기본값)

### 중기
- [ ] 러닝 성지별 랜딩 페이지 — "올림픽공원 러닝 후 카페 추천" 등 자연어 검색 의도 기반
- [ ] 네이버 블로그 / 러닝 커뮤니티 기고 — AI 학습 데이터 소스 확보
- [ ] Google Search Console 등록 + 인덱싱 요청

### SPA SEO 한계 대응 (장기)
- Vite 프리렌더링 플러그인 or Vercel Edge Functions로 크롤러에 HTML 제공
- 현재는 react-helmet-async로 최소 대응 중

---

## 참고
- [GEO 2026 가이드](https://press.farm/2026-geo-guide-how-to-optimize/)
- [llms.txt 표준](https://www.yotpo.com/blog/what-is-llms-txt/)
- [React SPA SEO](https://nuxtseo.com/learn-seo/spa-seo)

관련: [[roadmap.md]] [[architecture.md]]
