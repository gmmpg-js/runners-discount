import { readFileSync } from 'fs'

const URL = 'https://lywtgihcewgnxssfqlgm.supabase.co/rest/v1/places'
const KEY = process.env.VITE_SUPABASE_ANON_KEY

const CAT = { food: 'restaurant', other: 'restaurant', sports: 'cafe', stay: 'cafe' }
const COND = {
  distance_proof: '러닝 기록 인증 필요',
  running_record: '당일 러닝 기록 인증',
  any_runner: '러닝 후 방문',
  marathon_medal: '마라톤 메달/완주증 인증',
}

const places = JSON.parse(readFileSync('./scripts/places_data_2.json', 'utf8')).places

const rows = places.map(p => ({
  id: p.id,
  name: p.name,
  address: p.address,
  lat: p.lat,
  lng: p.lng,
  location: `POINT(${p.lng} ${p.lat})`,
  category: CAT[p.category] || p.category,
  discount_content: p.discount_description,
  discount_badge: p.discount_badge || null,
  discount_rate: p.discount_rate > 0 ? p.discount_rate : null,
  discount_rules: p.discount_rules || null,
  image_url: p.image_url || null,
  auth_condition: p.discount_condition
    ?.replace(/[{}]/g, '').split(',')
    .map(k => COND[k.trim()] || k.trim()).join(' + '),
  expired_at: p.discount_rules?.find(r => r.event_end_date)?.event_end_date || null,
  status: 'approved',
}))

const res = await fetch(URL, {
  method: 'POST',
  headers: {
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates',
  },
  body: JSON.stringify(rows),
})

if (res.ok) {
  console.log(`✅ ${rows.length}개 upsert 완료`)
} else {
  const err = await res.json()
  console.error('❌', err.message || err)
}
