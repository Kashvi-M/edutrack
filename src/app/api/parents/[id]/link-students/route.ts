import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { studentIds } = body

    if (!Array.isArray(studentIds)) {
      return NextResponse.json({ error: 'Invalid student IDs' }, { status: 400 })
    }

    // Update parent with linked students
    const parent = await prisma.parent.update({
      where: { id },
      data: {
        students: {
          set: studentIds.map((studentId: string) => ({ id: studentId }))
        }
      },
      include: {
        students: {
          include: {
            user: true,
            class: true
          }
        }
      }
    })

    return NextResponse.json(parent)
  } catch (error) {
    console.error('Error linking students:', error)
    return NextResponse.json({ error: 'Failed to link students' }, { status: 500 })
  }
}