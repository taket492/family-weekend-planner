import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        spots: {
          include: {
            spot: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const plan = await prisma.plan.create({
      data: {
        title: body.title,
        description: body.description,
        date: new Date(body.date),
        region: body.region,
        spots: {
          create: body.spots?.map((spot: { spotId: string; visitTime?: string; notes?: string }, index: number) => ({
            spotId: spot.spotId,
            order: index,
            visitTime: spot.visitTime ? new Date(spot.visitTime) : null,
            notes: spot.notes
          })) || []
        }
      },
      include: {
        spots: {
          include: {
            spot: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    )
  }
}