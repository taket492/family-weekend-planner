import { NextRequest, NextResponse } from 'next/server'
import { Event, EventCategory } from '@/types'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const region = searchParams.get('region') || '静岡市'
    const prefecture = searchParams.get('prefecture') || '静岡県'
    const category = searchParams.get('category') as EventCategory
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const isChildFriendly = searchParams.get('isChildFriendly') === 'true'

    let events: Event[] = generateMockEvents(region, prefecture)

    // フィルター適用
    if (category) {
      events = events.filter(e => e.category === category)
    }
    
    if (isChildFriendly) {
      events = events.filter(e => e.isChildFriendly)
    }
    
    if (startDate) {
      const start = new Date(startDate)
      events = events.filter(e => new Date(e.startDate) >= start)
    }
    
    if (endDate) {
      const end = new Date(endDate)
      events = events.filter(e => new Date(e.endDate) <= end)
    }

    // 地域でフィルターして日付順でソート
    events = events
      .filter(e => e.location?.includes(region) || e.location?.includes(prefecture))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

function generateMockEvents(region: string, prefecture: string): Event[] {
  const currentDate = new Date()
  const events: Event[] = [
    {
      id: 'event_1',
      title: '静岡市子供まつり',
      description: '子供向けのワークショップやゲームが盛りだくさん',
      startDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      location: '静岡市中央公園',
      isChildFriendly: true,
      category: EventCategory.FESTIVAL,
      registrationRequired: false,
      price: 0
    },
    {
      id: 'event_2',
      title: '浜松餃子フェスティバル',
      description: '家族みんなで楽しめる餃子の祭典',
      startDate: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(currentDate.getTime() + 16 * 24 * 60 * 60 * 1000),
      location: '浜松城公園',
      isChildFriendly: true,
      category: EventCategory.FESTIVAL,
      registrationRequired: false,
      price: 500
    },
    {
      id: 'event_3',
      title: 'キッズ料理教室',
      description: '親子で一緒に料理を作ろう',
      startDate: new Date(currentDate.getTime() + 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(currentDate.getTime() + 21 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      location: '静岡県コミュニティセンター',
      isChildFriendly: true,
      category: EventCategory.WORKSHOP,
      registrationRequired: true,
      maxParticipants: 20,
      price: 1500
    },
    {
      id: 'event_4',
      title: '富士山写真展',
      description: '子供も楽しめる富士山の美しい写真展',
      startDate: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      location: '富士市文化会館',
      isChildFriendly: true,
      category: EventCategory.EXHIBITION,
      registrationRequired: false,
      price: 300
    },
    {
      id: 'event_5',
      title: '沼津港海鮮まつり',
      description: '新鮮な海の幸を家族で楽しもう',
      startDate: new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(currentDate.getTime() + 12 * 24 * 60 * 60 * 1000),
      location: '沼津港',
      isChildFriendly: true,
      category: EventCategory.SEASONAL,
      registrationRequired: false,
      price: 0
    }
  ]

  return events
}
