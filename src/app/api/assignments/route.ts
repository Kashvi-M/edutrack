import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET assignments (filtered by role)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let assignments

    if (session.user.role === 'TEACHER') {
      // Get teacher's assignments only
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id }
      })

      if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
      }

      assignments = await prisma.assignment.findMany({
        where: {
          subject: {
            teacherId: teacher.id
          }
        },
        include: {
          subject: {
            include: {
              class: true
            }
          },
          _count: {
            select: { submissions: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (session.user.role === 'STUDENT') {
      // Get student's class assignments
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: { class: true }
      })

      if (!student || !student.classId) {
        return NextResponse.json([])
      }

      assignments = await prisma.assignment.findMany({
        where: {
          subject: {
            classId: student.classId
          }
        },
        include: {
          subject: {
            include: {
              class: true,
              teacher: {
                include: {
                  user: true
                }
              }
            }
          },
          submissions: {
            where: {
              studentId: student.id
            }
          }
        },
        orderBy: { dueDate: 'asc' }
      })
    } else {
      // Admin can see all
      assignments = await prisma.assignment.findMany({
        include: {
          subject: {
            include: {
              class: true,
              teacher: {
                include: {
                  user: true
                }
              }
            }
          },
          _count: {
            select: { submissions: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

// POST create new assignment (Teacher only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, subjectId, dueDate, maxMarks } = body

    // Verify teacher owns this subject
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        teacherId: teacher.id
      }
    })

    if (!subject) {
      return NextResponse.json({ error: 'You can only create assignments for your subjects' }, { status: 403 })
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        subjectId,
        dueDate: new Date(dueDate),
        maxMarks: parseInt(maxMarks)
      },
      include: {
        subject: {
          include: {
            class: true
          }
        }
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
  }
}