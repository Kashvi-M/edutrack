import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { name, rollNumber, classId, password } = body

    // First, get the student to access userId
    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Update user name
    await prisma.user.update({
      where: { id: student.userId },
      data: {
        name,
        ...(password && password.length >= 6 ? { password: await bcrypt.hash(password, 10) } : {})
      }
    })

    // Update student data
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        rollNumber,
        classId: classId || null
      },
      include: {
        user: true,
        class: true,
        parent: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}