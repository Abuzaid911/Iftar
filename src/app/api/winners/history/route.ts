// Create a new file: src/app/api/winners/history/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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

    return NextResponse.json(winners);
  } catch (error) {
    console.error('Error fetching winner history:', error);
    return NextResponse.json([], { status: 500 });
  }
}