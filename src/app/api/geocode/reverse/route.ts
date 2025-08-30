import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude parameters are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      )
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ja`
    
    const response = await fetch(geocodeUrl)
    const data = await response.json()

    if (data.status !== 'OK' || !data.results?.length) {
      return NextResponse.json(
        { error: 'Failed to reverse geocode coordinates' },
        { status: 404 }
      )
    }

    const result = data.results[0]

    return NextResponse.json({
      formattedAddress: result.formatted_address,
      placeId: result.place_id
    })
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}