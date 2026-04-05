import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all subjects
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subjects = await prisma.subject.findMany({
      include: {
        class: true,
        teacher: {
          include: {
            user: true
          }
        },
        _count: {
          select: { assignments: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(subjects)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
  }
}

// POST create new subject
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, classId, teacherId } = body

    const subject = await prisma.subject.create({
      data: {
        name,
        classId,
        teacherId
      },
      include: {
        class: true,
        teacher: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json(subject, { status: 201 })
  } catch (error) {
    console.error('Error creating subject:', error)
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 })
  }
}