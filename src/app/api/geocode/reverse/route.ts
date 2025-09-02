import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Reverse geocoding is no longer supported. Please use region-based searches instead.' },
    { status: 410 } // Gone
  )
}