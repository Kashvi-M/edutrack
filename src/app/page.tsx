'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Check, Shield, GraduationCap, Users, UserCheck, Settings2, Mail, Phone, MapPin } from 'lucide-react'
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

  // Smooth scroll handler
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 antialiased selection:bg-zinc-200/60 scroll-smooth">
      
      {/* Header / Navbar */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-md bg-zinc-900 flex items-center justify-center text-white font-semibold text-lg tracking-tight">
              E
            </div>
            <span className="text-xl font-semibold text-zinc-900 tracking-tight">EduTrack</span>
          </div>

          {/* Navigation Links Corner */}
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <a 
                href="#home" 
                onClick={(e) => handleScroll(e, 'home')}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                Home
              </a>
              <a 
                href="#about" 
                onClick={(e) => handleScroll(e, 'about')}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                About Us
              </a>
              <a 
                href="#contact" 
                onClick={(e) => handleScroll(e, 'contact')}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                Contact Us
              </a>
            </nav>
            <Badge variant="secondary" className="font-medium bg-zinc-100 text-zinc-600 border border-zinc-200/60 px-2.5 py-0.5 text-xs rounded-full">
              v1.0 Beta
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero / Portal Entry Section (Home Target) */}
      <main id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Side - Context/Value proposition */}
          <div className="lg:col-span-7 space-y-8 max-w-2xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium">
                <Shield className="w-3.5 h-3.5 text-zinc-500" />
                Institutional Management Platform
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.15]">
                A unified core for school coordination and metrics.
              </h1>
              <p className="text-lg text-zinc-600 leading-relaxed max-w-xl">
                Streamline academic administration, safely structure records, coordinate homework lifecycles, and access analytics—all under one clear environment.
              </p>
            </div>

            {/* Micro-Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 max-w-md border-t border-zinc-200 pt-8">
              <div>
                <div className="text-2xl font-bold text-zinc-900 tracking-tight">4 Roles</div>
                <div className="text-xs font-medium text-zinc-500 mt-0.5">Isolated Access Control</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-900 tracking-tight">10+ Tools</div>
                <div className="text-xs font-medium text-zinc-500 mt-0.5">Modular Functionality</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-900 tracking-tight">100%</div>
                <div className="text-xs font-medium text-zinc-500 mt-0.5">Localized Encryption</div>
              </div>
            </div>
          </div>

          {/* Right Side - Premium Login Card Frame */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto lg:ml-auto">
            <Card className="border-zinc-200 bg-white shadow-sm ring-1 ring-zinc-200/50 rounded-xl">
              <CardHeader className="space-y-1.5 pb-6">
                <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-900">Sign in</CardTitle>
                <CardDescription className="text-sm text-zinc-500">
                  Enter your credentials to access your administrative workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-zinc-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@school.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-10 border-zinc-200 bg-zinc-50/30 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 transition-all text-sm rounded-md"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-medium text-zinc-700">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-10 border-zinc-200 bg-zinc-50/30 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 transition-all text-sm rounded-md"
                    />
                  </div>
                  <Button type="submit" className="w-full h-10 text-sm font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-md shadow-sm transition-colors mt-2" disabled={loading}>
                    {loading ? 'Verifying profile...' : 'Enter Workspace'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
                <Separator className="bg-zinc-100" />
                <div className="text-xs text-zinc-500 space-y-2.5 w-full">
                  <span className="font-semibold text-zinc-700 block tracking-wide uppercase text-[10px]">Development Sandbox Access</span>
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/60 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-zinc-800 text-xs">Administrative Profile</p>
                      <p className="text-[11px] font-mono text-zinc-500 mt-0.5">admin@edutrack.com / admin123</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono bg-white text-zinc-500 border-zinc-200 px-1.5">Demo</Badge>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* --- ABOUT US SECTION (Increased Font Sizes) --- */}
      <section id="about" className="bg-white border-y border-zinc-200/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16 space-y-3">
            <h2 className="text-4xl font-bold tracking-tight text-zinc-900">Configured Workspaces</h2>
            <p className="text-lg text-zinc-500 leading-relaxed">
              Tailored interfaces built to deliver essential workflows and zero data-noise for every role.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-zinc-200 bg-white shadow-none rounded-xl p-1.5">
              <div className="p-5 space-y-4">
                <div className="w-10 h-10 rounded-md bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-700">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg font-bold text-zinc-900 tracking-tight">For Teachers</CardTitle>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Build clean curriculum logs, track daily attendance grids, grade submissions, and view timeline logs.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-zinc-200 bg-white shadow-none rounded-xl p-1.5">
              <div className="p-5 space-y-4">
                <div className="w-10 h-10 rounded-md bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg font-bold text-zinc-900 tracking-tight">For Students</CardTitle>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Access transparent task queues, turn in homework modules, check performance rubrics, and view schedules.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-zinc-200 bg-white shadow-none rounded-xl p-1.5">
              <div className="p-5 space-y-4">
                <div className="w-10 h-10 rounded-md bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-700">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg font-bold text-zinc-900 tracking-tight">For Parents</CardTitle>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Review progress graphs safely, audit missing student files, and coordinate clear notification lines with instructors.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-zinc-200 bg-white shadow-none rounded-xl p-1.5">
              <div className="p-5 space-y-4">
                <div className="w-10 h-10 rounded-md bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-700">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg font-bold text-zinc-900 tracking-tight">For Admins</CardTitle>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Maintain global system tables, monitor structural server health metrics, add accounts, and inspect data.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Execution List */}
      <section className="py-20 bg-zinc-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16 space-y-2">
              <h2 className="text-4xl font-bold tracking-tight text-zinc-900">Functional Capabilities</h2>
              <p className="text-base text-zinc-500">Every piece designed around fast, accessible information density.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-5 h-5 rounded-md border border-zinc-300 bg-white flex items-center justify-center mt-0.5 shadow-xs">
                  <Check className="w-3 h-3 text-zinc-800" strokeWidth={3} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900">Task Architecture</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">Deploy structured assignments across classrooms with strict date boundary rules and clean submission logs.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-5 h-5 rounded-md border border-zinc-300 bg-white flex items-center justify-center mt-0.5 shadow-xs">
                  <Check className="w-3 h-3 text-zinc-800" strokeWidth={3} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900">Attendance State Control</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">Log attendance parameters smoothly with integrated computation variables and cross-sectional logs.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-5 h-5 rounded-md border border-zinc-300 bg-white flex items-center justify-center mt-0.5 shadow-xs">
                  <Check className="w-3 h-3 text-zinc-800" strokeWidth={3} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900">Performance Metrics</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">Track metrics across assignments, structured via clean evaluation rubrics and intuitive score charts.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-5 h-5 rounded-md border border-zinc-300 bg-white flex items-center justify-center mt-0.5 shadow-xs">
                  <Check className="w-3 h-3 text-zinc-800" strokeWidth={3} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900">Deterministic Permissions</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">Enforce strict data fences between distinct user types to keep sensitive administrative layers fully protected.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTACT US SECTION (Increased Font Sizes) --- */}
      <section id="contact" className="bg-white border-t border-zinc-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold tracking-tight text-zinc-900">Contact Infrastructure Support</h2>
              <p className="text-lg text-zinc-500 leading-relaxed">Reach out to your deployment team for technical queries or account issues.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-zinc-50 border border-zinc-200/60 rounded-xl flex flex-col items-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-base font-bold text-zinc-900">Email Helpdesk</span>
                <span className="text-sm font-mono text-zinc-600 font-semibold">support@edutrack.com</span>
              </div>

              <div className="p-6 bg-zinc-50 border border-zinc-200/60 rounded-xl flex flex-col items-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-base font-bold text-zinc-900">System Ops Hot-Line</span>
                <span className="text-sm font-mono text-zinc-600 font-semibold">+1 (555) 019-2834</span>
              </div>

              <div className="p-6 bg-zinc-50 border border-zinc-200/60 rounded-xl flex flex-col items-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-base font-bold text-zinc-900">Main Server Lab</span>
                <span className="text-sm text-zinc-600 font-semibold">Bldg 4, Academic District</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-zinc-900 flex items-center justify-center text-white font-semibold text-sm">
                E
              </div>
              <span className="text-sm font-semibold text-zinc-900 tracking-tight">EduTrack</span>
            </div>
            <p className="text-xs text-zinc-400">© 2026 EduTrack. Built for calm, scalable school environments.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}