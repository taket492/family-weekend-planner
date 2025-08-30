import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    
    // 逆ジオコーディング（座標から住所）
    if (lat && lng) {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ja`
      
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'Family Weekend Planner App'
        }
      })
      
      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to reverse geocode coordinates' },
          { status: 404 }
        )
      }
      
      const data = await response.json()
      
      return NextResponse.json({
        formattedAddress: data.display_name || `${lat}, ${lng}`
      })
    }
    
    // ジオコーディング（住所から座標）
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }

    // OpenStreetMap Nominatim API（無料）を使用
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=jp&limit=1&accept-language=ja`
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Family Weekend Planner App'
      }
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Geocoding service unavailable' },
        { status: 503 }
      )
    }
    
    const data = await response.json()

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    const result = data[0]

    return NextResponse.json({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
      placeId: result.place_id || result.osm_id
    })
  } catch (error) {
    console.error('Error geocoding address:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}