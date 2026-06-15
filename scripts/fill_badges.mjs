/**
 * discount_badge가 null인 매장의 discount_content에서 badge를 자동 생성
 */
import Anthropic from '@anthropic-ai/sdk'

const SUPABASE_URL = 'https://lywtgihcewgnxssfqlgm.supabase.co'
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

const client = new Anthropic({ apiKey: ANTHROPIC_KEY })

const SYSTEM = `할인 혜택 문구에서 핵심 최대 혜택을 한 줄로 요약합니다.

규칙:
- "최대 N%" 또는 "최대 N,000원" 또는 "아메리카노 1잔" 처럼 짧게 (10자 이내)
- 여러 조건이 있으면 가장 큰 혜택 기준
- 숫자 할인이 없으면 "혜택 제공"
- 이미 "최대 N%" 형태면 그대로
- 접두어나 설명 없이 결과만 반환`

async function makeBadge(content) {
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 30,
    system: SYSTEM,
    messages: [{ role: 'user', content }],
  })
  return msg.content[0].text.trim()
}

const res = await fetch(
  `${SUPABASE_URL}/rest/v1/places?discount_badge=is.null&status=eq.approved&select=id,name,discount_content`,
  { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
)
const places = await res.json()
console.log(`badge 없는 장소 ${places.length}개 처리\n`)

for (const place of places) {
  const badge = await makeBadge(place.discount_content)
  console.log(`${place.name}: ${badge}`)

  await fetch(`${SUPABASE_URL}/rest/v1/places?id=eq.${place.id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ discount_badge: badge }),
  })
}
console.log('\n✅ 완료')
