/**
 * discount_content 문장을 Claude Haiku로 다듬어 DB에 업데이트
 * 정보 변경 없이 문장만 자연스럽게 개선
 * 실행: node scripts/prettify_content.mjs [--dry-run]
 */
import Anthropic from '@anthropic-ai/sdk'

const DRY_RUN = process.argv.includes('--dry-run')
const SUPABASE_URL = 'https://lywtgihcewgnxssfqlgm.supabase.co'
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

const client = new Anthropic({ apiKey: ANTHROPIC_KEY })

const SYSTEM = `당신은 러너 친화 매장의 할인 혜택 문구를 다듬는 편집자입니다.

규칙:
1. 정보(조건, 대상, 혜택 수치)는 절대 변경하지 않습니다
2. 문장을 더 자연스럽고 간결한 한국어로 다듬습니다
3. 혜택이 한 가지인 경우: 불릿 없이 단일 문장으로 표현합니다
4. 혜택이 여러 가지인 경우: 각 항목을 "• " 불릿으로 시작해 줄바꿈(\n)으로 구분합니다
5. 각 항목은 "조건 → 혜택" 흐름으로 읽히게 합니다
6. 불필요한 반복 표현을 줄입니다 (예: "당일 러닝 기록 인증 시"가 매 줄 반복되면 공통 조건은 첫 줄이나 생략)
7. 원문에 없는 구체적 수치(거리, 할인율 등)는 절대 추가하거나 추정하지 않습니다
8. 원문이 "거리 구간별" 처럼 수치가 없는 경우, 그 표현을 그대로 유지합니다
9. 원문이 이미 깔끔하면 그대로 반환합니다
10. 추가 설명, 접두어, 주석("참고:") 없이 다듬은 문장만 반환합니다

예시:
입력: "당일 5km 이상 러닝 기록 인증 시 아사히 생맥주 300ml\n당일 10km 이상 러닝 기록 인증 시 아사히 생맥주 500ml"
출력: "• 5km 이상 → 아사히 생맥주 300ml\n• 10km 이상 → 아사히 생맥주 500ml"

입력: "당일 러닝 기록 인증 시 음료 10% 할인"
출력: "당일 러닝 기록 인증 시 음료 10% 할인"`

async function prettify(content) {
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: SYSTEM,
    messages: [{ role: 'user', content }],
  })
  return msg.content[0].text.trim()
}

// 1. DB에서 approved 장소 조회
const res = await fetch(
  `${SUPABASE_URL}/rest/v1/places?status=eq.approved&select=id,name,discount_content`,
  { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
)
const places = await res.json()
console.log(`총 ${places.length}개 장소 처리 시작 (${DRY_RUN ? 'dry-run' : '실제 업데이트'})\n`)

let updated = 0, skipped = 0
for (const place of places) {
  const original = place.discount_content
  if (!original) { skipped++; continue }

  const prettified = await prettify(original)

  if (prettified === original) {
    process.stdout.write(`⊙ ${place.name}: 변경 없음\n`)
    skipped++
    continue
  }

  console.log(`\n✏️  ${place.name}`)
  console.log(`  전: ${original.replace(/\n/g, ' / ')}`)
  console.log(`  후: ${prettified.replace(/\n/g, ' / ')}`)

  if (!DRY_RUN) {
    const upRes = await fetch(
      `${SUPABASE_URL}/rest/v1/places?id=eq.${place.id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ discount_content: prettified }),
      }
    )
    if (!upRes.ok) console.error(`  ❌ 업데이트 실패:`, await upRes.text())
  }
  updated++
}

console.log(`\n완료 — 수정: ${updated}개, 변경 없음: ${skipped}개`)
