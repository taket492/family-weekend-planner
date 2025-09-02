import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    
    // 住所から地域情報を抽出
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }

    // 住所から都道府県と市区町村を抽出
    const addressParts = address.split('')
    let prefecture = ''
    let city = ''
    
    // 静岡県の主要都市リスト
    const shizuokaCities = ['静岡市', '浜松市', '沼津市', '熱海市', '三島市', '富士宮市', '伊東市', '島田市', '富士市', '磐田市', '焼津市', '掛川市', '藤枝市', '御殿場市', '袋井市', '下田市', '裾野市', '湖西市', '伊豆市', '御前崎市', '菊川市', '伊豆の国市', '牧之原市']
    
    // 地域情報を抽出
    if (address.includes('静岡県') || address.includes('静岡')) {
      prefecture = '静岡県'
      
      // 市区町村を特定
      for (const cityName of shizuokaCities) {
        if (address.includes(cityName)) {
          city = cityName
          break
        }
      }
      
      if (!city) {
        city = '静岡市' // デフォルト
      }
    } else {
      // その他の県の場合の簡易処理
      const prefectureMatch = address.match(/(.+[都道府県])/)
      if (prefectureMatch) {
        prefecture = prefectureMatch[1]
      }
      
      const cityMatch = address.match(/[都道府県](.+[市区町村])/)
      if (cityMatch) {
        city = cityMatch[1]
      }
    }

    return NextResponse.json({
      formattedAddress: address,
      prefecture: prefecture || '静岡県',
      city: city || '静岡市',
      region: city.replace(/[市区町村]/g, '') || '静岡',
      isShizuokaAddress: address.includes('静岡')
    })
  } catch (error) {
    console.error('Error geocoding address:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}