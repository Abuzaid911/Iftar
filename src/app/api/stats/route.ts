import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [postsCount, votesCount, usersCount] = await Promise.all([
      prisma.post.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      prisma.vote.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      prisma.user.count(),
    ])

    return NextResponse.json({
      posts: postsCount,
      votes: votesCount,
      users: usersCount,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Error fetching stats' },
      { status: 500 }
    )
  }
}