'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from './Navbar'

type Props = {
  children: React.ReactNode
  requiredRole: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'
}

export default function DashboardLayout({ children, requiredRole }: Props) {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSession()
  }, [])

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      
      if (!data?.user) {
        router.push('/login')
        return
      }

      if (data.user.role !== requiredRole) {
        router.push('/unauthorized')
        return
      }

      setSession(data)
    } catch (error) {
      console.error('Session error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role={session.user.role} userName={session.user.name} />
      <main>{children}</main>
    </div>
  )
}