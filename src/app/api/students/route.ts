import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET all students
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    let whereClause: any = {}
    
    if (classId) {
      whereClause.classId = classId
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        class: true,
        parent: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { rollNumber: 'asc' }
    })

    return NextResponse.json(students)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

// POST create new student
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, rollNumber, classId } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Check if roll number already exists
    const existingRollNumber = await prisma.student.findUnique({
      where: { rollNumber }
    })

    if (existingRollNumber) {
      return NextResponse.json({ error: 'Roll number already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and student
    const student = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        student: {
          create: {
            rollNumber,
            classId: classId || null
          }
        }
      },
      include: {
        student: {
          include: {
            class: true
          }
        }
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}