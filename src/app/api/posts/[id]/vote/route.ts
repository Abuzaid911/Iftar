import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    const { id } = params

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const post = await prisma.post.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        postId: id,
        userId: user.id,
      },
    })

    if (existingVote) {
      await prisma.vote.delete({
        where: { id: existingVote.id },
      })

      return NextResponse.json({ success: true, action: "removed" })
    } else {
      await prisma.vote.create({
        data: {
          postId: id,
          userId: user.id,
        },
      })

      return NextResponse.json({ success: true, action: "added" })
    }
  } catch (error) {
    console.error("Error toggling vote:", error)
    return NextResponse.json({ error: "Error toggling vote" }, { status: 500 })
  }
}