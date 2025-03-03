import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const winner = await prisma.post.findFirst({
      where: {
        createdAt: {
          gte: today,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        votes: true,
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: [
        {
          votes: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'asc',
        },
      ],
    })

    if (!winner) {
      return NextResponse.json(null)
    }

    // Split the comma-separated image URLs into an array
    const images = winner.imageUrl.split(',')
    const winnerWithImages = {
      ...winner,
      images,
    }

    return NextResponse.json(winnerWithImages)
  } catch (error) {
    console.error('Error fetching daily winner:', error)
    return NextResponse.json(
      { error: 'Error fetching daily winner' },
      { status: 500 }
    )
  }
}