import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
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

    // Check if the post belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: params.postId },
      select: { userId: true },
    })

    if (post?.userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot vote for your own post' },
        { status: 400 }
      )
    }

    // Check if user has already voted for this post today
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        postId: params.postId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    })

    if (existingVote) {
      return NextResponse.json(
        { error: 'Already voted for this post today' },
        { status: 400 }
      )
    }

    const vote = await prisma.vote.create({
      data: {
        userId: user.id,
        postId: params.postId,
      },
    })

    return NextResponse.json(vote)
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json({ error: 'Error voting' }, { status: 500 })
  }
}