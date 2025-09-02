'use client'

import { useState, useEffect } from 'react'
import { Event, EventCategory } from '@/types'

interface EventListProps {
  region?: string
  prefecture?: string
  spotId?: string
}

const eventCategoryLabels = {
  [EventCategory.FESTIVAL]: '🎪 祭り・フェスティバル',
  [EventCategory.WORKSHOP]: '🛠️ ワークショップ',
  [EventCategory.EXHIBITION]: '🖼️ 展示会',
  [EventCategory.SEASONAL]: '🌸 季節イベント',
  [EventCategory.SPORTS]: '⚽ スポーツ',
  [EventCategory.CULTURAL]: '🎭 文化イベント'
}

export default function EventList({ region, prefecture, spotId }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (region) {
      fetchEvents()
    }
  }, [region, prefecture, spotId])

  const fetchEvents = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (region) params.append('region', region)
      if (prefecture) params.append('prefecture', prefecture)
      if (spotId) params.append('spotId', spotId)
      params.append('isChildFriendly', 'true')

      const response = await fetch(`/api/events?${params}`)
      if (!response.ok) throw new Error('Failed to fetch events')
      
      const data = await response.json()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🎉 周辺イベント情報</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🎉 周辺イベント情報</h2>
        <p className="text-red-600">イベント情報の取得に失敗しました</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        🎉 周辺イベント情報
        <span className="text-lg font-normal text-gray-500 ml-3">
          {events.length}件
        </span>
      </h2>
      
      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-gray-500">現在開催中・予定のイベントはありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {eventCategoryLabels[event.category]}
                </span>
              </div>
              
              {event.description && (
                <p className="text-sm text-gray-600 mb-3">{event.description}</p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{new Date(event.startDate).toLocaleDateString('ja-JP')}</span>
                  {event.startDate !== event.endDate && (
                    <span> ~ {new Date(event.endDate).toLocaleDateString('ja-JP')}</span>
                  )}
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>{event.location}</span>
                  </div>
                )}
                
                {event.price !== undefined && (
                  <div className="flex items-center gap-1">
                    <span>💰</span>
                    <span>{event.price === 0 ? '無料' : `${event.price.toLocaleString()}円`}</span>
                  </div>
                )}
                
                {event.registrationRequired && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <span>📝</span>
                    <span>要予約</span>
                    {event.maxParticipants && (
                      <span>（定員{event.maxParticipants}名）</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {event.isChildFriendly && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    👶 子連れ歓迎
                  </span>
                )}
                {event.registrationRequired && (
                  <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    予約する
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}