// Ensure we're using 'id' consistently
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        postId: params.id,
        userId: user.id,
      },
    })

    if (existingVote) {
      await prisma.vote.delete({
        where: { id: existingVote.id },
      })
      return NextResponse.json({ message: 'Vote removed' })
    }

    await prisma.vote.create({
      data: {
        postId: params.id,
        userId: user.id,
      },
    })

    return NextResponse.json({ message: 'Vote added' })
  } catch (error) {
    console.error('Error handling vote:', error)
    return NextResponse.json(
      { error: 'Error processing vote' },
      { status: 500 }
    )
  }
}