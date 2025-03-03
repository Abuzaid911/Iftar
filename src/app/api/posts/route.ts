import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '9')
    const offset = (page - 1) * limit

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
            email: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Error fetching posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const images = formData.getAll('images') as File[]

    const uploadPromises = images.map(async (image) => {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = buffer.toString('base64')

      return cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64Image}`,
        { folder: 'iftar' }
      )
    })

    const uploadedImages = await Promise.all(uploadPromises)
    const imageUrls = uploadedImages.map(upload => upload.secure_url)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const post = await prisma.post.create({
      data: {
        title: 'Iftar Photos',
        description: '',
        imageUrl: imageUrls.join(','), // Store multiple URLs separated by comma
        userId: user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession()
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('id')
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId || '' },
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

    // Delete images from Cloudinary
    const imageUrls = post.imageUrl.split(',')
    const deletePromises = imageUrls.map(url => {
      const publicId = url.split('/').pop()?.split('.')[0]
      return cloudinary.uploader.destroy(`iftar/${publicId}`)
    })

    await Promise.all(deletePromises)
    await prisma.post.delete({ where: { id: postId || '' } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Error deleting post' }, { status: 500 })
  }
}