import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all classes
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const classes = await prisma.class.findMany({
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        _count: {
          select: { students: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(classes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
  }
}

// POST create new class
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, section, academicYear, teacherId } = body

    const newClass = await prisma.class.create({
      data: {
        name,
        section,
        academicYear,
        teacherId: teacherId || null
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}