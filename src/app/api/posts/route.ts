// src/app/api/posts/route.ts
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { prisma, ensureConnection } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// Enhanced cloudinary configuration with proper error handling
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request) {
  console.log('[API] GET /api/posts - Request received');
  
  try {
    // Test database connection first using the more robust method
    await ensureConnection();
    console.log('[API] Database connection successful');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const offset = (page - 1) * limit;
    
    console.log(`[API] GET /api/posts - Fetching page ${page}, limit ${limit}`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get posts with a single query to reduce database calls
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
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
      }),
      prisma.post.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
    ]);
    
    console.log(`[API] GET /api/posts - Successfully fetched ${posts.length} posts`);
    
    // Return with pagination metadata
    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: totalCount ? Math.ceil(totalCount / limit) : 0,
        hasMore: posts.length === limit,
      }
    });
  } catch (error) {
    console.error('[API] GET /api/posts - Error fetching posts:', error);
    
    // Check if it's a Prisma error
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
      
    // Extract useful information from the error
    const isPrismaError = errorMessage.includes('Prisma') || 
                          errorMessage.includes('database') ||
                          errorMessage.includes('connection');
    
    return NextResponse.json(
      { 
        error: 'Error fetching posts', 
        details: errorMessage,
        type: isPrismaError ? 'database' : 'unknown'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication first using the auth function from lib/auth
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify required environment variables
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary environment variables')
      return NextResponse.json({ 
        error: 'Server configuration error: Missing Cloudinary credentials' 
      }, { status: 500 })
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse form data
    const formData = await request.formData()
    const images = formData.getAll('images') as File[]

    if (images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    // Upload images to Cloudinary with enhanced error handling
    const uploadPromises = images.map(async (image) => {
      try {
        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64Image = buffer.toString('base64')

        // Add a console.log to check the file size
        console.log(`Uploading image of size: ${buffer.length} bytes`)

        // Set a reasonable file size limit (10MB)
        if (buffer.length > 10 * 1024 * 1024) {
          throw new Error('File size exceeds 10MB limit')
        }

        const uploadResult = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${base64Image}`,
          { 
            folder: 'iftar',
            resource_type: 'auto' // Handle different file types
          }
        )
        
        return uploadResult.secure_url
      } catch (err: unknown) {
        console.error('Error uploading to Cloudinary:', err)
        // Fixed: Properly handle the unknown error type
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        throw new Error(`Image upload failed: ${errorMessage}`)
      }
    })

    let imageUrls;
    try {
      const uploadedImages = await Promise.all(uploadPromises)
      imageUrls = uploadedImages
    } catch (err: unknown) {
      console.error('Failed to upload images:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.json({ 
        error: `Failed to upload images: ${errorMessage}` 
      }, { status: 500 })
    }

    // Create post in database
    try {
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
    } catch (dbError: unknown) {
      console.error('Database error creating post:', dbError)
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown error'
      return NextResponse.json({ 
        error: `Database error: ${errorMessage}` 
      }, { status: 500 })
    }
  } catch (error: unknown) {
    console.error('Error creating post:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: `Error creating post: ${errorMessage}` 
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  // Use the auth function from lib/auth
  const session = await auth()
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('id')
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fix for TypeScript error: Validate postId is not null
  if (!postId) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId }, // Now postId is guaranteed to be a string
      select: { userId: true, imageUrl: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || post.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete images from Cloudinary
    const imageUrls = post.imageUrl.split(',')
    const deletePromises = imageUrls.map(url => {
      const publicId = url.split('/').pop()?.split('.')[0]
      return publicId ? cloudinary.uploader.destroy(`iftar/${publicId}`) : Promise.resolve()
    })

    await Promise.all([
      ...deletePromises,
      prisma.vote.deleteMany({ where: { postId } }),
      prisma.post.delete({ where: { id: postId } })
    ])

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error deleting post:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Error deleting post: ${errorMessage}` }, { status: 500 })
  }
}