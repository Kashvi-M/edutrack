import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id },
      include: {
        students: {
          include: {
            user: true,
            class: true
          }
        }
      }
    })

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
    }

    return NextResponse.json(parent)
  } catch (error) {
    console.error('Error fetching parent:', error)
    return NextResponse.json({ error: 'Failed to fetch parent data' }, { status: 500 })
  }
}