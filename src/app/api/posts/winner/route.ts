// src/app/api/winner/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Get the post with the most votes for today
    const winner = await prisma.post.findFirst({
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
    });

    if (!winner) {
      return NextResponse.json({ error: 'No posts found for today' }, { status: 404 });
    }

    // Format the response
    const imageUrls = winner.imageUrl ? winner.imageUrl.split(',') : [];
    
    return NextResponse.json({
      id: winner.id,
      imageUrls,
      createdAt: winner.createdAt,
      user: winner.user,
      _count: winner._count
    });
  } catch (error) {
    console.error('Error determining winner:', error);
    return NextResponse.json(
      { error: 'Error determining winner' },
      { status: 500 }
    );
  }
}