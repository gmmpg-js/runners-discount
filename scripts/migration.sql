-- 1. 카테고리 constraint 확장
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_category_check;
ALTER TABLE places ADD CONSTRAINT places_category_check
  CHECK (category IN ('cafe', 'restaurant', 'dessert', 'food', 'other', 'sports', 'stay'));

-- 2. 새 컬럼 추가
ALTER TABLE places ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE places ADD COLUMN IF NOT EXISTS discount_badge text;
ALTER TABLE places ADD COLUMN IF NOT EXISTS discount_rate int;
ALTER TABLE places ADD COLUMN IF NOT EXISTS discount_rules jsonb;
