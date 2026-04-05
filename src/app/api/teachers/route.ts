import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET all teachers
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subjects: {
          include: {
            class: true
          }
        },
        _count: {
          select: { subjects: true, classes: true }
        }
      }
    })

    return NextResponse.json(teachers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 })
  }
}

// POST create new teacher
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and teacher in a transaction
    const teacher = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'TEACHER',
        teacher: {
          create: {}
        }
      },
      include: {
        teacher: true
      }
    })

    return NextResponse.json(teacher, { status: 201 })
  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 })
  }
}