// src/app/api/winners/history/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query for past winners (maybe last 7 days excluding today)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    
    const winners = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: pastDate
        }
      },
      orderBy: [
        { 
          votes: {
            _count: 'desc'
          }
        }
      ],
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      }
    });

    return NextResponse.json({
      data: winners,
      status: 'success'
    });
  } catch (error) {
    console.error('Error fetching winner history:', error);
    return NextResponse.json({ error: 'Failed to fetch winners' }, { status: 500 });
  }
}