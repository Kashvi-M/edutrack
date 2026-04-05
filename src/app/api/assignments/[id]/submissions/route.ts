import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: assignmentId } = await context.params

    // Get assignment with submissions
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        subject: {
          include: {
            class: true
          }
        },
        submissions: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          },
          orderBy: {
            submittedAt: 'desc'
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}