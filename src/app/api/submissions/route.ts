import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST submit assignment (Student only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { assignmentId } = body

    // Get student
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: student.id
        }
      }
    })

    if (existingSubmission) {
      return NextResponse.json({ error: 'Assignment already submitted' }, { status: 400 })
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: student.id,
        status: 'SUBMITTED'
      },
      include: {
        assignment: {
          include: {
            subject: true
          }
        }
      }
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json({ error: 'Failed to submit assignment' }, { status: 500 })
  }
}