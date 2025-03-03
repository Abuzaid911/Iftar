import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  const session = await getServerSession()
  
  if (!session?.user?.email || session.user.email !== 'your-admin-email@example.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await Promise.all([
      prisma.vote.deleteMany({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      prisma.post.deleteMany({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resetting stats:', error)
    return NextResponse.json(
      { error: 'Error resetting stats' },
      { status: 500 }
    )
  }
}