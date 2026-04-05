import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AttendanceStatus } from '@prisma/client'

// GET attendance records
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const date = searchParams.get('date')

    let whereClause: any = {}

    if (session.user.role === 'STUDENT') {
      // Student sees only their attendance
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id }
      })
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }
      whereClause.studentId = student.id
    } else if (studentId) {
      // Teacher/Admin can filter by student
      whereClause.studentId = studentId
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: true,
            class: true
          }
        },
        teacher: {
          include: {
            user: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}

// POST mark attendance (Teacher only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    const body = await request.json()
    const { studentId, date, status } = body

    // Cast to proper type
    const attendanceStatus = status as AttendanceStatus

    // Check if attendance already marked for this student on this date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_date: {
          studentId,
          date: new Date(date)
        }
      }
    })

    if (existingAttendance) {
  // Update existing record
  const updated = await prisma.attendance.update({
    where: { id: existingAttendance.id },
    data: { status: attendanceStatus },  // Changed from 'status'
    include: {
      student: {
        include: {
          user: true
        }
      }
    }
  })
  return NextResponse.json(updated)
}

// Create new attendance record
const attendance = await prisma.attendance.create({
  data: {
    studentId,
    date: new Date(date),
    status: attendanceStatus,  // Changed from 'status'
    markedBy: teacher.id
  },
  include: {
    student: {
      include: {
        user: true
      }
    }
  }
})

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error('Error marking attendance:', error)
    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 })
  }
}