-- 카테고리 constraint 확장
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_category_check;
ALTER TABLE places ADD CONSTRAINT places_category_check
  CHECK (category IN ('cafe', 'restaurant', 'dessert', 'food', 'other', 'sports', 'stay'));

-- lat/lng 컬럼 (없으면 추가)
ALTER TABLE places ADD COLUMN IF NOT EXISTS lat float;
ALTER TABLE places ADD COLUMN IF NOT EXISTS lng float;

-- 새 컬럼
ALTER TABLE places ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE places ADD COLUMN IF NOT EXISTS discount_badge text;
ALTER TABLE places ADD COLUMN IF NOT EXISTS discount_rate int;
ALTER TABLE places ADD COLUMN IF NOT EXISTS discount_rules jsonb;
ALTER TABLE places ADD COLUMN IF NOT EXISTS map_url text;
ALTER TABLE places ADD COLUMN IF NOT EXISTS naver_map_url text;
