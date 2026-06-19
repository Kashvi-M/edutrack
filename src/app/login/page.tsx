'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    // First, ensure we're logged out
    await fetch('/api/auth/signout', { method: 'POST' })
    
    // Small delay to ensure signout completes
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      toast.error('Invalid email or password')
      setLoading(false)
      return
    }

    // Fetch session to get user role
    const sessionResponse = await fetch('/api/auth/session')
    const sessionData = await sessionResponse.json()
    console.log('Session after login:', sessionData) // ADDED THIS
    
    // Redirect based on role
    if (sessionData?.user?.role === 'ADMIN') {
      window.location.href = '/admin'
    } else if (sessionData?.user?.role === 'TEACHER') {
      window.location.href = '/teacher'
    } else if (sessionData?.user?.role === 'STUDENT') {
      window.location.href = '/student'
    } else if (sessionData?.user?.role === 'PARENT') {
      window.location.href = '/parent'
    } else {
      window.location.href = '/admin'
    }
  } catch (error) {
    toast.error('Something went wrong. Please try again.')
    setLoading(false)
  }
}

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            EduTrack
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@edutrack.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-white border-r border-zinc-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Demo credentials:</p>
          <p>Email: admin@edutrack.com</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  )
}