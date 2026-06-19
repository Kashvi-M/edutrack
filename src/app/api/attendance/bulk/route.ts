import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AttendanceStatus } from '@prisma/client'

function getUTCDate(dateInput: string) {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
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
    const { attendanceRecords, date } = body

    const attendanceDate = getUTCDate(date) // Normalized to UTC Midnight

    const results = await Promise.all(
      attendanceRecords.map(async (record: { studentId: string; status: string }) => {
        const attendanceStatus = record.status as AttendanceStatus
        
        const existing = await prisma.attendance.findUnique({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: attendanceDate
            }
          }
        })

        if (existing) {
          return prisma.attendance.update({
            where: { id: existing.id },
            data: { status: attendanceStatus }
          })
        } else {
          return prisma.attendance.create({
            data: {
              studentId: record.studentId,
              date: attendanceDate,
              status: attendanceStatus,
              markedBy: teacher.id
            }
          })
        }
      })
    )

    return NextResponse.json({ success: true, count: results.length })
  } catch (error) {
    console.error('Error bulk marking attendance:', error)
    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 })
  }
}