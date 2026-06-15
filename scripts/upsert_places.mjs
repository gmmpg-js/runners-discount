import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lywtgihcewgnxssfqlgm.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function mapCondition(template) {
  if (!template) return null
  const labels = {
    distance_proof: '러닝 기록 인증 필요',
    running_record: '당일 러닝 기록 인증',
    any_runner: '러닝 후 방문',
    marathon_medal: '마라톤 메달/완주증 인증',
  }
  return template.replace(/[{}]/g, '').split(',')
    .map(p => labels[p.trim()] || p.trim()).join(' + ')
}

function getExpiredAt(rules) {
  for (const r of rules) {
    if (r.event_end_date) return r.event_end_date
  }
  return null
}

const places = PLACES_DATA

const rows = places.map(p => ({
  id: p.id,
  name: p.name,
  address: p.address,
  lat: p.lat,
  lng: p.lng,
  category: p.category,
  discount_content: p.discount_description,
  discount_badge: p.discount_badge,
  discount_rate: p.discount_rate > 0 ? p.discount_rate : null,
  discount_rules: p.discount_rules,
  auth_condition: mapCondition(p.discount_condition),
  expired_at: getExpiredAt(p.discount_rules),
  image_url: p.image_url || null,
  status: 'approved',
}))

console.log(`총 ${rows.length}개 upsert 시작...`)

const BATCH = 20
let ok = 0, fail = 0
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { error } = await supabase
    .from('places')
    .upsert(batch, { onConflict: 'id' })
  if (error) {
    console.error(`배치 ${i}~${i + batch.length - 1} 실패:`, error.message)
    fail += batch.length
  } else {
    ok += batch.length
    process.stdout.write(`\r  ${ok}/${rows.length} 완료`)
  }
}

console.log(`\n\n결과: 성공 ${ok}개, 실패 ${fail}개`)
