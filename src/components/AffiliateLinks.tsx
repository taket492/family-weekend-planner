'use client'

import { Spot, Restaurant } from '@/types'

interface AffiliateLinkProps {
  spot?: Spot
  restaurant?: Restaurant
}

export default function AffiliateLinks({ spot, restaurant }: AffiliateLinkProps) {
  const item = spot || restaurant
  if (!item) return null

  const generateHotPepperUrl = (name: string, address: string) => {
    const query = encodeURIComponent(`${name} ${address}`)
    return `https://www.hotpepper.jp/strJ001/?q=${query}&partner_id=your_partner_id`
  }

  const generateGurunaviUrl = (name: string) => {
    const query = encodeURIComponent(name)
    return `https://r.gnavi.co.jp/area/jp/rs/?q=${query}&partner_id=your_partner_id`
  }

  const generateAsobiyuUrl = (category: string, region: string) => {
    let activityType = 'experience'
    if (category.includes('PLAYGROUND') || category.includes('ENTERTAINMENT')) {
      activityType = 'amusement'
    } else if (category.includes('MUSEUM')) {
      activityType = 'culture'
    }
    
    return `https://www.asoview.com/${activityType}/${region}/?partner_id=your_partner_id`
  }

  const generateJtbUrl = (region: string) => {
    return `https://www.jtb.co.jp/area/${region}/?partner_id=your_partner_id`
  }

  return (
    <div className="border-t mt-4 pt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">🎫 体験・予約</h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* レストラン予約 */}
        {(restaurant || spot?.category === 'RESTAURANT') && (
          <>
            <a
              href={generateHotPepperUrl(item.name, item.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
            >
              🍽️ ホットペッパー予約
            </a>
            
            <a
              href={generateGurunaviUrl(item.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              🍴 ぐるなび予約
            </a>
          </>
        )}

        {/* 体験チケット */}
        {spot && spot.category !== 'RESTAURANT' && (
          <>
            <a
              href={generateAsobiyuUrl(spot.category, '静岡')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              🎟️ アソビュー体験
            </a>
            
            <a
              href={generateJtbUrl('shizuoka')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              🧳 じゃらん遊び体験
            </a>
          </>
        )}
      </div>

      {/* 季節特化アフィリエイト */}
      {spot?.seasonalEventType && (
        <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-md border border-amber-200">
          <h5 className="text-sm font-medium text-amber-800 mb-2">
            🌟 今の季節におすすめ
          </h5>
          
          <div className="grid grid-cols-1 gap-2">
            {spot.seasonalEventType === 'STRAWBERRY_PICKING' && (
              <a
                href="https://www.asoview.com/leisure/act0168/?area=shizuoka&partner_id=your_partner_id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 bg-pink-500 text-white px-3 py-2 rounded-md hover:bg-pink-600 text-sm"
              >
                🍓 いちご狩り体験を予約
              </a>
            )}
            
            {spot.seasonalEventType === 'SWIMMING_POOL' && (
              <a
                href="https://www.asoview.com/leisure/act0020/?area=shizuoka&partner_id=your_partner_id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 text-sm"
              >
                🏊 プール・海水浴チケット
              </a>
            )}
            
            {spot.seasonalEventType === 'FIREWORKS' && (
              <a
                href="https://www.jtb.co.jp/area/shizuoka/fireworks/?partner_id=your_partner_id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 bg-purple-500 text-white px-3 py-2 rounded-md hover:bg-purple-600 text-sm"
              >
                🎆 花火大会ツアー予約
              </a>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 text-center mt-2">
        ※ 外部サイトでの予約・購入に進みます
      </div>
    </div>
  )
}