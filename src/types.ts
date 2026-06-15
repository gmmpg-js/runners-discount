export interface Place {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  category: 'cafe' | 'restaurant' | 'dessert' | 'food' | 'other' | 'sports' | 'stay'
  discount_content: string
  discount_badge?: string
  discount_rate?: number
  discount_rules?: Array<{
    id: string
    benefit_type: 'percent' | 'amount' | 'free_item' | 'custom'
    benefit_value?: string
    benefit_target?: string
    custom_text?: string
    condition_type: string
    condition_value?: string
    distance_mode?: string
    record_window?: string
    event_end_date?: string
  }>
  image_url?: string
  auth_condition?: string
  expired_at?: string
  map_url?: string
  naver_map_url?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}
