'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch('/api/auth/signout', { method: 'POST' })
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

      const sessionResponse = await fetch('/api/auth/session')
      const sessionData = await sessionResponse.json()
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
              E
            </div>
            <span className="text-2xl font-bold text-slate-900">EduTrack</span>
          </div>
          <Badge variant="secondary" className="hidden sm:flex text-sm px-3 py-1">v1.0 Beta</Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-sm px-4 py-1.5">
                Complete Education Management Solution
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                Manage Your School <span className="text-blue-600">Efficiently</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                A comprehensive platform designed to streamline school operations, manage student data, track attendance, handle assignments, and monitor academic performance - all in one place.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">4</div>
                <div className="text-sm text-slate-600">User Roles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10+</div>
                <div className="text-sm text-slate-600">Features</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-slate-600">Secure</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="w-full max-w-md mx-auto">
            <Card className="border-slate-200 shadow-xl">
              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="text-3xl">Sign in</CardTitle>
                <CardDescription className="text-base">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@school.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 text-base"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pt-2">
                <Separator />
                <div className="text-sm text-slate-600 space-y-2 w-full">
                  <p className="font-semibold text-base">Demo Credentials:</p>
                  <div className="grid gap-2 text-sm">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-medium text-slate-900">Admin Account</p>
                      <p className="text-slate-600">admin@edutrack.com / admin123</p>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-y">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-600">
              Everything you need to manage your educational institution effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-3xl">👨‍🏫</span>
                </div>
                <CardTitle className="text-xl">For Teachers</CardTitle>
                <CardDescription className="text-base">
                  Create assignments, mark attendance, grade submissions, and track student progress efficiently.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <span className="text-3xl">🎓</span>
                </div>
                <CardTitle className="text-xl">For Students</CardTitle>
                <CardDescription className="text-base">
                  View assignments, submit work, check grades, and monitor attendance with real-time updates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <span className="text-3xl">👨‍👩‍👧</span>
                </div>
                <CardTitle className="text-xl">For Parents</CardTitle>
                <CardDescription className="text-base">
                  Track your child's academic performance, attendance, and stay informed about their progress.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <span className="text-3xl">⚙️</span>
                </div>
                <CardTitle className="text-xl">For Admins</CardTitle>
                <CardDescription className="text-base">
                  Complete control over classes, teachers, students, subjects, and system-wide analytics.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Complete Feature Set</h2>
              <p className="text-xl text-slate-600">All the tools you need in one platform</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xl">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Assignment Management</h3>
                    <p className="text-base text-slate-600">Create, distribute, and grade assignments with deadline tracking and automated notifications.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xl">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Attendance Tracking</h3>
                    <p className="text-base text-slate-600">Quick attendance marking with detailed reports and percentage calculations.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xl">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Grade Management</h3>
                    <p className="text-base text-slate-600">Comprehensive grading system with feedback and performance analytics.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xl">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Performance Analytics</h3>
                    <p className="text-base text-slate-600">Visual charts and graphs showing student performance trends over time.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xl">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Role-Based Access</h3>
                    <p className="text-base text-slate-600">Secure authentication with different permissions for admins, teachers, students, and parents.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xl">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Real-time Updates</h3>
                    <p className="text-base text-slate-600">Instant notifications and updates across all user dashboards.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold text-white">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100">
              Join thousands of educational institutions using EduTrack to streamline their operations.
            </p>
            <Button size="lg" variant="secondary" className="text-base h-12 px-8">
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                E
              </div>
              <span className="text-lg font-bold text-slate-900">EduTrack</span>
            </div>
            <p className="text-base text-slate-600">© 2024 EduTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}