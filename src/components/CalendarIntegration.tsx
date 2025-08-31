'use client'

import { useState } from 'react'
import { Spot, Restaurant } from '@/types'

interface CalendarIntegrationProps {
  spot?: Spot
  restaurant?: Restaurant
  onClose: () => void
}

export default function CalendarIntegration({ spot, restaurant, onClose }: CalendarIntegrationProps) {
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [notes, setNotes] = useState('')

  const item = spot || restaurant
  if (!item) return null

  const generateGoogleCalendarUrl = () => {
    const title = `お出かけ: ${item.name}`
    const details = `
場所: ${item.address}
${notes ? `メモ: ${notes}` : ''}
${item.phoneNumber ? `電話: ${item.phoneNumber}` : ''}
${item.website ? `サイト: ${item.website}` : ''}

Google Mapsで開く: https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}
    `.trim()

    const startDateTime = new Date(`${eventDate}T${eventTime}`)
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000) // 2時間後

    const formatDateTime = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${formatDateTime(startDateTime)}/${formatDateTime(endDateTime)}`,
      details: details,
      location: item.address
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  const generateAppleCalendarUrl = () => {
    const title = encodeURIComponent(`お出かけ: ${item.name}`)
    const location = encodeURIComponent(item.address)
    const startDateTime = new Date(`${eventDate}T${eventTime}`)
    
    return `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${item.website || ''}
DTSTART:${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${title}
DESCRIPTION:${encodeURIComponent(notes)}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`
  }

  const addToGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(), '_blank')
  }

  const addToAppleCalendar = () => {
    const element = document.createElement('a')
    element.setAttribute('href', generateAppleCalendarUrl())
    element.setAttribute('download', `${item.name}.ics`)
    element.click()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          📅 カレンダーに追加
        </h3>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">{item.name}</h4>
          <p className="text-sm text-gray-600">{item.address}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              訪問日
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              時間
            </label>
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ（任意）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="持ち物や注意事項など"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={addToGoogleCalendar}
              disabled={!eventDate || !eventTime}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              📅 Googleカレンダー
            </button>
            
            <button
              onClick={addToAppleCalendar}
              disabled={!eventDate || !eventTime}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              🍎 Appleカレンダー
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}