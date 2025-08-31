'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface LocationSelectorProps {
  onLocationSelect: (location: {
    latitude: number
    longitude: number
    address: string
  }) => void
}

interface FormData {
  address: string
}

export default function LocationSelector({ onLocationSelect }: LocationSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const getCurrentLocation = () => {
    setIsLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('位置情報がサポートされていません')
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          const response = await fetch(
            `/api/geocode?lat=${latitude}&lng=${longitude}`
          )
          const data = await response.json()
          
          onLocationSelect({
            latitude,
            longitude,
            address: data.formattedAddress || `${latitude}, ${longitude}`
          })
        } catch {
          onLocationSelect({
            latitude,
            longitude,
            address: `${latitude}, ${longitude}`
          })
        }
        
        setIsLoading(false)
      },
      () => {
        setError('位置情報の取得に失敗しました')
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000
      }
    )
  }

  const onAddressSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/geocode?address=${encodeURIComponent(data.address)}`
      )
      
      if (!response.ok) {
        throw new Error('住所の検索に失敗しました')
      }
      
      const location = await response.json()
      
      onLocationSelect({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.formattedAddress
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '住所の検索に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        📍 検索エリア設定
      </h2>
      
      <div className="space-y-4">
        <button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              位置情報を取得中...
            </>
          ) : (
            <>
              📍 現在地を使用
            </>
          )}
        </button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">または</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-3">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              住所を入力
            </label>
            <input
              {...register('address', { required: '住所を入力してください' })}
              type="text"
              placeholder="例: 静岡市葵区、浜松市中区"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>
          
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">静岡エリア クイック選択</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onAddressSubmit({ address: '静岡市葵区' })}
                className="bg-green-50 text-green-700 border border-green-200 py-2 px-3 rounded-md text-sm hover:bg-green-100"
              >
                静岡市
              </button>
              <button
                type="button"
                onClick={() => onAddressSubmit({ address: '浜松市中区' })}
                className="bg-green-50 text-green-700 border border-green-200 py-2 px-3 rounded-md text-sm hover:bg-green-100"
              >
                浜松市
              </button>
              <button
                type="button"
                onClick={() => onAddressSubmit({ address: '沼津市' })}
                className="bg-green-50 text-green-700 border border-green-200 py-2 px-3 rounded-md text-sm hover:bg-green-100"
              >
                沼津市
              </button>
              <button
                type="button"
                onClick={() => onAddressSubmit({ address: '富士市' })}
                className="bg-green-50 text-green-700 border border-green-200 py-2 px-3 rounded-md text-sm hover:bg-green-100"
              >
                富士市
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                検索中...
              </>
            ) : (
              <>
                🔍 住所で検索
              </>
            )}
          </button>
        </form>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}