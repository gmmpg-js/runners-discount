export const CATEGORY_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  cafe:       { icon: '☕', color: '#8B5E3C', label: '카페' },
  restaurant: { icon: '🍽️', color: '#E5533D', label: '식당' },
  dessert:    { icon: '🍰', color: '#E67EA8', label: '디저트' },
  food:       { icon: '🍽️', color: '#E5533D', label: '식당' },
  other:      { icon: '📍', color: '#A8E63D', label: '기타' },
  sports:     { icon: '🏃', color: '#3DA8E6', label: '스포츠' },
  stay:       { icon: '🏨', color: '#9B59B6', label: '숙소' },
}

export function summarizeDiscount(badge: string | undefined, content: string): string {
  if (badge) return badge
  if (!content) return '할인'
  const pct = content.match(/(\d+)\s*%/)
  if (pct) return `${pct[1]}% 할인`
  if (content.includes('무료')) {
    const m = content.match(/(\S+)\s*무료/)
    return m ? `${m[1]} 무료` : '무료'
  }
  if (content.includes('km')) return 'km당 할인'
  return content.length > 8 ? content.slice(0, 8) + '…' : content
}
