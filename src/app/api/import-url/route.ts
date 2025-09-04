import { NextRequest, NextResponse } from 'next/server'

const WHITELIST = ['tabelog.com', 'gnavi.co.jp', 'gurunavi.com']

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    let host: string
    try {
      host = new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }
    if (!WHITELIST.some(d => host.endsWith(d))) {
      return NextResponse.json({ error: 'Unsupported domain' }, { status: 400 })
    }

    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' })
    if (!resp.ok) return NextResponse.json({ error: 'Failed to fetch page' }, { status: resp.status })
    const html = await resp.text()

    const strip = (s?: string | null) => (s || '').replace(/\s+/g, ' ').trim()
    const match = (re: RegExp) => {
      const m = html.match(re)
      return m ? strip(m[1]) : ''
    }

    // Name
    let name = match(/<title>([^<]+)<\/title>/i)
    name = name.replace(/\s*-\s*食べログ.*/i, '').replace(/\s*-\s*ぐるなび.*/i, '')

    // Address and phone (best-effort)
    let address = ''
    // schema.org
    address = match(/"address"\s*:\s*\{[^}]*"streetAddress"\s*:\s*"([^"]+)"/i) ||
              match(/住所[：:]*\s*<[^>]*>\s*([^<]+)\s*</i)

    const phone = match(/tel[:：]\s*([0-9\-\(\) ]{9,})/i) || match(/"telephone"\s*:\s*"([^"]+)"/i) || match(/>\s*(\d{2,4}-\d{2,4}-\d{3,4})\s*</)

    // Hours
    const openingHours = match(/営業時間[：:]*\s*<[^>]*>\s*([^<]+)\s*</i) || match(/"openingHours"\s*:\s*"([^"]+)"/i)

    return NextResponse.json({
      name,
      address,
      phoneNumber: phone,
      website: url,
      openingHours
    })
  } catch (e) {
    console.error('URL import error', e)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}

export const runtime = 'nodejs'

