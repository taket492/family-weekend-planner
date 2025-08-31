import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: { spot: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, spotId, notes, tags } = await request.json()
    
    if (!userId || !spotId) {
      return NextResponse.json(
        { error: 'User ID and Spot ID are required' },
        { status: 400 }
      )
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        spotId,
        notes,
        tags: tags || []
      },
      include: { spot: true }
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error('Error creating bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, spotId } = await request.json()
    
    if (!userId || !spotId) {
      return NextResponse.json(
        { error: 'User ID and Spot ID are required' },
        { status: 400 }
      )
    }

    await prisma.bookmark.delete({
      where: {
        userId_spotId: {
          userId,
          spotId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    )
  }
}