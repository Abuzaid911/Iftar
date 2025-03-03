import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const posts = await prisma.post.findMany({
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
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: {
        votes: {
          _count: 'desc',
        },
      },
      take: 5,
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error fetching trending posts' }, { status: 500 })
  }
}