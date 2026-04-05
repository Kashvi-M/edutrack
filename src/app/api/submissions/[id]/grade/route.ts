import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: submissionId } = await context.params
    const body = await request.json()
    const { grade, feedback } = body

    console.log('Grading submission:', submissionId, 'Grade:', grade, 'Feedback:', feedback)

    // Update submission with grade
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: parseInt(grade),
        feedback: feedback || null,
        status: 'GRADED'
      },
      include: {
        student: {
          include: {
            user: true
          }
        },
        assignment: true
      }
    })

    console.log('Successfully graded submission:', submission.id)
    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error grading submission:', error)
    return NextResponse.json({ 
      error: 'Failed to grade submission',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}