/**
 * approved 장소 목록을 Supabase에서 조회해 public/sitemap.xml 생성
 * 실행: node scripts/generate_sitemap.mjs
 */
import { writeFileSync } from 'fs'
import { config } from 'dotenv'

config({ path: '.env' })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY
const BASE_URL = process.env.SITE_URL || 'https://runners-discount.vercel.app'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 환경변수 필요')
  process.exit(1)
}

const res = await fetch(
  `${SUPABASE_URL}/rest/v1/places?status=eq.approved&select=id,created_at`,
  { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
)

if (!res.ok) {
  console.error('❌ Supabase 조회 실패:', await res.text())
  process.exit(1)
}

const places = await res.json()
const today = new Date().toISOString().split('T')[0]

const urls = [
  `  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  ...places.map(p => {
    const lastmod = p.created_at ? p.created_at.split('T')[0] : today
    return `  <url>\n    <loc>${BASE_URL}/place/${p.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  }),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

writeFileSync('public/sitemap.xml', xml)
console.log(`✅ sitemap.xml 생성 완료 — ${places.length + 1}개 URL`)
