import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const trendingPosts = await prisma.post.findMany({
      take: 10,
      include: {
        user: { select: { name: true, image: true } },
        votes: true,
        _count: { select: { votes: true } },
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    return NextResponse.json({
      data: {
        posts: trendingPosts.map(post => ({
          id: post.id,
          title: post.title,
          description: post.description,
          imageUrls: post.imageUrl ? post.imageUrl.split(',') : [],
          createdAt: post.createdAt,
          user: post.user,
          votes: post.votes,
          _count: post._count
        })),
      }
    });
  
  } catch (error) {
    console.error('Error in GET /api/posts/trending:', error);
    return NextResponse.json({
      data: { posts: [] },
      error: 'Internal Server Error'
    }, { status: 500 });
  }
}