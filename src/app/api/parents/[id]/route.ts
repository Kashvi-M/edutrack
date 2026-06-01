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
    const { name, phone, password, studentIds } = body

    // Get parent to access userId
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
    }

    // Update user name and password if provided
    await prisma.user.update({
      where: { id: parent.userId },
      data: {
        name,
        ...(password && password.length >= 6 ? { password: await bcrypt.hash(password, 10) } : {})
      }
    })

    // Update parent data
    const updatedParent = await prisma.parent.update({
      where: { id },
      data: {
        phone: phone || null,
        ...(studentIds ? {
          students: {
            set: studentIds.map((studentId: string) => ({ id: studentId }))
          }
        } : {})
      },
      include: {
        user: true,
        students: {
          include: {
            user: true,
            class: true
          }
        }
      }
    })

    return NextResponse.json(updatedParent)
  } catch (error) {
    console.error('Error updating parent:', error)
    return NextResponse.json({ error: 'Failed to update parent' }, { status: 500 })
  }
}