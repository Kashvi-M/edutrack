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
    
    console.log("Student ID:", studentId)
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true }
    })

    if (!student || !student.classId) {
      return NextResponse.json([])
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        subject: {
          classId: student.classId
        }
      },
      include: {
        subject: true,
        submissions: {
          where: {
            studentId: student.id
          }
        }
      },
      orderBy: { dueDate: 'desc' }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}