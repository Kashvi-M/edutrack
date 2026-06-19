// C:\Users\smahe\Downloads\edutrack\src\app\api\attendance\route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AttendanceStatus } from '@prisma/client'

// Helper function to create a clean UTC Date object (Midnight UTC)
function getUTCDate(dateInput: string) {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

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
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id }
      })
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }
      whereClause.studentId = student.id
    } else if (studentId) {
      whereClause.studentId = studentId
    }

    if (date) {
      // Create a clean boundaries matching how dates are saved
      const targetDate = getUTCDate(date)
      const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0))
      const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999))
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          include: { user: true, class: true }
        },
        teacher: {
          include: { user: true }
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

    const attendanceStatus = status as AttendanceStatus
    const attendanceDate = getUTCDate(date) // Use clean normalized UTC Date

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_date: {
          studentId,
          date: attendanceDate
        }
      }
    })

    if (existingAttendance) {
      const updated = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: { status: attendanceStatus },
        include: {
          student: { include: { user: true } }
        }
      })
      return NextResponse.json(updated)
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        date: attendanceDate,
        status: attendanceStatus,
        markedBy: teacher.id
      },
      include: {
        student: { include: { user: true } }
      }
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error('Error marking attendance:', error)
    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 })
  }
}