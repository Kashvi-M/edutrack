import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ studentId: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studentId } = await context.params

    // Verify this student belongs to this parent
    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id },
      include: {
        students: {
          where: { id: studentId }
        }
      }
    })

    if (!parent || parent.students.length === 0) {
      return NextResponse.json({ error: 'Unauthorized access to this student' }, { status: 403 })
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        studentId
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}