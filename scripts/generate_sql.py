#!/usr/bin/env python3
"""
places_data.json → upsert SQL 생성
실행: python3 scripts/generate_sql.py > scripts/upsert_places.sql
"""
import json, sys, re

CONDITION_LABELS = {
    'distance_proof': '러닝 기록 인증 필요',
    'running_record': '당일 러닝 기록 인증',
    'any_runner': '러닝 후 방문',
    'marathon_medal': '마라톤 메달/완주증 인증',
}

def map_condition(template):
    if not template:
        return None
    parts = re.sub(r'[{}]', '', template).split(',')
    return ' + '.join(CONDITION_LABELS.get(p.strip(), p.strip()) for p in parts)

def get_expired_at(rules):
    for r in rules:
        if r.get('event_end_date'):
            return r['event_end_date']
    return None

def esc(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def esc_int(v):
    if v is None or v == 0:
        return 'NULL'
    return str(int(v))

data = json.load(open('scripts/places_data.json', encoding='utf-8'))
places = data['places']

print("-- Auto-generated upsert SQL")
print("-- Run in Supabase SQL Editor AFTER migration.sql\n")
print("INSERT INTO places")
print("  (id, name, address, lat, lng, category, discount_content, discount_badge,")
print("   discount_rate, discount_rules, auth_condition, expired_at, image_url, status)")
print("VALUES")

rows = []
for p in places:
    row = "  ({id}, {name}, {address}, {lat}, {lng}, {cat}, {dc}, {badge}, {rate}, {rules}, {auth}, {exp}, {img}, 'approved')".format(
        id=esc(p['id']),
        name=esc(p['name']),
        address=esc(p['address']),
        lat=p['lat'],
        lng=p['lng'],
        cat=esc(p['category']),
        dc=esc(p['discount_description']),
        badge=esc(p['discount_badge']),
        rate=esc_int(p.get('discount_rate')),
        rules=esc(json.dumps(p['discount_rules'], ensure_ascii=False)),
        auth=esc(map_condition(p.get('discount_condition'))),
        exp=esc(get_expired_at(p['discount_rules'])),
        img=esc(p.get('image_url')),
    )
    rows.append(row)

print(',\n'.join(rows))
print("ON CONFLICT (id) DO UPDATE SET")
print("  name = EXCLUDED.name,")
print("  address = EXCLUDED.address,")
print("  lat = EXCLUDED.lat,")
print("  lng = EXCLUDED.lng,")
print("  category = EXCLUDED.category,")
print("  discount_content = EXCLUDED.discount_content,")
print("  discount_badge = EXCLUDED.discount_badge,")
print("  discount_rate = EXCLUDED.discount_rate,")
print("  discount_rules = EXCLUDED.discount_rules,")
print("  auth_condition = EXCLUDED.auth_condition,")
print("  expired_at = EXCLUDED.expired_at,")
print("  image_url = EXCLUDED.image_url,")
print("  status = EXCLUDED.status;")

print(f"\n-- 총 {len(places)}개 장소", file=sys.stderr)
