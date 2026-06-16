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

### 5. sitemap.xml
- `scripts/generate_sitemap.mjs`로 빌드 시 자동 생성
- `npm run build` 실행 시 Supabase에서 approved 장소 목록 쿼리해 갱신

### 6. index.html 기본 meta 태그
- `lang="ko"` 설정
- 기본 title, description, OG, twitter card, robots 태그 삽입

---

## 남은 작업 (배포 후)

### 단기
- [ ] Google Search Console 등록 + sitemap.xml 제출 + 인덱싱 요청
- [ ] 네이버 서치어드바이저 등록 → sitemap 제출 (→ 아래 가이드 참고)
- [ ] JSON-LD 필드 보강 — `@type: "Cafe"` 또는 `"Restaurant"` 서브타입, `openingHours`, `telephone`

### 중기
- [ ] 러닝 성지별 랜딩 페이지 — "올림픽공원 러닝 후 카페 추천" 등 자연어 검색 의도 기반 정적 콘텐츠
- [ ] 네이버 블로그 / 러닝 커뮤니티 기고 — AI 학습 데이터 소스 확보

### SPA SEO 한계 대응 (장기)
- 현재 react-helmet-async는 **클라이언트 사이드에서만 meta 태그를 주입** → 구글봇 2차 렌더링 큐 지연 문제, AI 크롤러는 JS 실행 불가
- 선택지: `vite-plugin-prerender` (빌드타임 정적 HTML 생성) 또는 Vercel Edge Functions (크롤러 감지 후 SSR HTML 반환)
- 단기 대안: Vercel OG Image + Edge Middleware로 크롤러에만 정적 HTML 제공

---

## 참고 자료 & 심층 가이드

### 1. React SPA + Googlebot — 핵심 문제

**요약:** Googlebot은 JS를 실행할 수 있지만, 2-wave 인덱싱 구조로 인해 렌더링 큐가 수 시간~수 일 지연될 수 있다. 빈 HTML 쉘만 있는 SPA는 2차 큐에 던져지고 크롤 버짓을 낭비한다.

- 실질적 해결책은 SSR(Next.js), SSG, 또는 프리렌더링
- react-helmet-async 단독으로는 **소셜 공유 미리보기**(트위터, 카카오톡)가 깨짐 — 소셜 크롤러는 JS 미실행

| 방법 | 장점 | 단점 | Runner's Discount 적합성 |
|---|---|---|---|
| react-helmet-async (현재) | 구현 간단 | 소셜 미리보기 안됨, 구글 지연 | 최소 대응으로 유지 |
| vite-plugin-prerender | 빌드타임 정적 HTML | 장소 추가 시 재빌드 필요 | 홈 + 일부 인기 장소에 적용 고려 |
| Vercel Edge Functions | 크롤러만 SSR, UX 변화 없음 | 구현 복잡도 있음 | 트래픽 증가 후 고려 |

참고: [JavaScript SEO 2026 가이드](https://fuelonline.com/seo/javascript-seo-guide-2026/) · [AI 크롤러가 SPA를 읽을 수 있나?](https://www.getpassionfruit.com/blog/javascript-rendering-and-ai-crawlers-can-llms-read-your-spa) · [React SEO 최적화 가이드](https://digispot.ai/blog/react-seo-optimization-guide)

---

### 2. AI 크롤러 동작 방식 (GPTBot / ClaudeBot / PerplexityBot)

**핵심:** 세 봇 모두 **JavaScript를 실행하지 않는다.** 초기 HTML만 수집하고 이동.

> "An analysis of over 500 million GPTBot fetches found zero evidence of JavaScript execution."

| 봇 | 운영 | JS 실행 | robots.txt 준수 |
|---|---|---|---|
| GPTBot | OpenAI | ❌ | ✅ |
| ClaudeBot | Anthropic | ❌ | ✅ |
| PerplexityBot | Perplexity | ❌ | ✅ |

→ **현재 Runner's Discount SPA는 AI 크롤러에 빈 HTML을 반환** → llms.txt로 보완하고 있지만, 장소 개별 페이지는 AI가 수집 불가. 장기적으로 프리렌더링 필요.

→ ChatGPT 응답의 92%가 Bing 인덱스 기반 → Bingbot도 JS 렌더링 제한적 → 동일 문제

참고: [AI Crawlers 2026 — Anagram](https://www.anagram.ai/blog/ai-crawlers-explained-gptbot-claudebot-perplexitybot-and-how-to-let-them-in-2026) · [Cloudflare: Who's Crawling Your Site in 2025](https://blog.cloudflare.com/from-googlebot-to-gptbot-whos-crawling-your-site-in-2025/)

---

### 3. GEO (Generative Engine Optimization) + llms.txt

**요약:** GEO는 AI 검색(ChatGPT, Perplexity, Gemini 등)에서 브랜드/서비스가 응답에 인용되도록 최적화하는 것. 기존 SEO와 달리 "링크 노출"이 아닌 "응답 내 언급"이 목표.

**llms.txt 효과:**
- robots.txt처럼 AI 봇에 서비스 맥락을 전달하는 신흥 표준
- AI 모델의 사이트 이해 비용을 줄여 정확한 인용 가능성 높임
- 아직 표준화 초기 단계이나 OpenAI, Anthropic 등 주요 봇이 인식 중

**GEO 실제 효과 (연구 결과):**
- 유창성 + 통계 조합: 35.8% 노출 향상
- 인용 + 인용구 조합: 34.4% 향상
- 한 사례에서 GEO 최적화 후 AI 검색 트래픽이 전체의 10%, 체류 시간은 구글 대비 30% 높음

**Runner's Discount 맥락:** `llms.txt`에 지역별 매장 목록 + 인증 방법을 구체적 수치와 함께 기술한 것이 GEO 관점에서 올바른 방향. "올림픽공원 러닝 후 카페 추천"류 질문에 우리 서비스가 언급될 수 있도록 외부 블로그/커뮤니티 언급 병행 필요.

참고: [GEO 완전 가이드 — Backlinko](https://backlinko.com/generative-engine-optimization-geo) · [llms.txt란? — Yotpo](https://www.yotpo.com/blog/what-is-llms-txt/) · [llms-txt.io GEO 소개](https://llms-txt.io/blog/what-is-generative-engine-optimization-geo)

---

### 4. JSON-LD LocalBusiness 보강 포인트

현재 구현: `name`, `address`, `geo`, `description` — 기본 수준.

**Google 리치 결과를 위해 추가 권장 필드:**

```json
{
  "@context": "https://schema.org",
  "@type": "Cafe",
  "name": "논도 서촌",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "자하문로6길 3",
    "addressLocality": "종로구",
    "addressRegion": "서울특별시",
    "addressCountry": "KR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 37.578,
    "longitude": 126.968
  },
  "description": "3km 이상 러닝 인증 시 음료 20% 할인",
  "url": "https://runners-discount.vercel.app/place/[id]"
}
```

- `@type`을 `"LocalBusiness"` 대신 `"Cafe"` 또는 `"Restaurant"` 서브타입으로 변경 → 리치 결과 트리거 조건 개선
- `PostalAddress` 구조화 (현재는 문자열) → Google이 주소를 파싱 가능하게
- 검증: [Google Rich Results Test](https://search.google.com/test/rich-results) · [Schema Markup Validator](https://validator.schema.org)

참고: [LocalBusiness Schema 완전 가이드](https://www.greadme.com/blog/schemas/what-is-local-business-schema-complete-guide) · [JSON-LD 예시 모음](https://jsonld.com/local-business/)

---

### 5. 한국 특화 — 네이버 서치어드바이저

네이버는 독자 크롤러(Yeti)를 운영하며, 서치어드바이저 등록 없이는 네이버 검색 노출이 불안정.

**등록 절차:**
1. [네이버 서치어드바이저](https://searchadvisor.naver.com) 접속 → 웹마스터도구
2. 사이트 URL 등록 → 소유권 확인 (HTML 태그 삽입 또는 파일 업로드)
3. `index.html` `<head>`에 메타 태그 추가:
   ```html
   <meta name="naver-site-verification" content="[발급된 코드]" />
   ```
4. sitemap.xml 제출 → Yeti 봇 크롤링 촉진

**주의:** 등록만으로 순위가 오르지 않음. 네이버 알고리즘은 콘텐츠 품질과 외부 언급(네이버 블로그, 카페 등) 비중이 높음.

참고: [네이버 서치어드바이저 등록 가이드](https://seo.co.kr/blog/naver-search-advisor/) · [네이버 SEO 최적화 방법](https://idearabbit.co.kr/%EB%84%A4%EC%9D%B4%EB%B2%84-seo-%EB%B0%A9%EB%B2%95/naver-highrank/)

---

관련: [[roadmap.md]] [[architecture.md]]
