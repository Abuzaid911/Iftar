import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { userId: true, imageUrl: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (post.userId !== user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const imageUrls = post.imageUrl.split(',')
    const deletePromises = imageUrls.map(url => {
      const publicId = url.split('/').pop()?.split('.')[0]
      if (publicId) {
        return cloudinary.uploader.destroy(`iftar/${publicId}`)
      }
      return Promise.resolve()
    })

    await Promise.all([
      ...deletePromises,
      prisma.vote.deleteMany({ where: { postId: params.id } }),
      prisma.post.delete({ where: { id: params.id } })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Error deleting post' },
      { status: 500 }
    )
  }
}