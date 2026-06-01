import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parents = await prisma.parent.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        students: {
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

    return NextResponse.json(parents)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch parents' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, phone, studentIds } = body

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const parent = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'PARENT',
        parent: {
          create: {
            phone: phone || null,
            ...(studentIds && studentIds.length > 0 ? {
              students: {
                connect: studentIds.map((id: string) => ({ id }))
              }
            } : {})
          }
        }
      },
      include: {
        parent: {
          include: {
            students: {
              include: {
                user: true,
                class: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(parent, { status: 201 })
  } catch (error) {
    console.error('Error creating parent:', error)
    return NextResponse.json({ error: 'Failed to create parent' }, { status: 500 })
  }
}