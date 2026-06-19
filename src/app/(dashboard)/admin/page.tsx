'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  GraduationCap, 
  UserCheck, 
  FolderMinus,
  FileText,
  Calendar,
  Activity,
  TrendingUp,
  CheckCircle2,
  LogOut
} from 'lucide-react'

export default function AdminDashboardPage() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Define the navigation architecture dynamically
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Classes', href: '/admin/classes', icon: BookOpen },
    { name: 'Teachers', href: '/admin/teachers', icon: UserCheck },
    { name: 'Students', href: '/admin/students', icon: GraduationCap },
    { name: 'Parents', href: '/admin/parents', icon: Users },
    { name: 'Subjects', href: '/admin/subjects', icon: FolderMinus },
  ]

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 antialiased">
      {/* Admin Top Navigation Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-zinc-900 flex items-center justify-center text-white font-bold text-base">
                E
              </div>
              <span className="text-lg font-bold text-zinc-900 tracking-tight">EduTrack</span>
            </div>
            
            {/* Top Navigation Links - Now fully functional links */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
                      isActive 
                        ? 'bg-zinc-100 text-zinc-900 font-semibold' 
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> 
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          
          {/* Profile Dropdown with Logout */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs font-mono uppercase bg-zinc-50 border-zinc-200 text-zinc-700 px-2 py-0.5">
              Admin
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-hidden">
                <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-white cursor-pointer hover:bg-zinc-800 transition-colors">
                  AD
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-1 border-zinc-200 shadow-sm rounded-md bg-white">
                <DropdownMenuLabel className="text-zinc-900 font-bold text-xs px-2 py-1.5">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-100" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-2 py-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50 font-semibold text-xs rounded-sm cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Section: Performance Tracking Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
            Performance Tracking
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Box 1: Assignments Issued */}
            <Card className="border-zinc-200 bg-white shadow-xs rounded-lg">
              <div className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold tracking-tight text-zinc-900">
                    Assignments Issued
                  </h3>
                  <FileText className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-2xl font-extrabold text-zinc-900 tracking-tight">1</div>
                  <p className="text-sm font-medium text-zinc-700 leading-snug">
                    Cumulative files published.
                  </p>
                </div>
              </div>
            </Card>

            {/* Box 2: Attendance Index Blocks */}
            <Card className="border-zinc-200 bg-white shadow-xs rounded-lg">
              <div className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold tracking-tight text-zinc-900">
                    Attendance Index Blocks
                  </h3>
                  <Calendar className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-2xl font-extrabold text-zinc-900 tracking-tight">1</div>
                  <p className="text-sm font-medium text-zinc-700 leading-snug">
                    Aggregated unique daily entries.
                  </p>
                </div>
              </div>
            </Card>

            {/* Box 3: System Presence Margin */}
            <Card className="border-zinc-200 bg-white shadow-xs rounded-lg">
              <div className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold tracking-tight text-zinc-900">
                    System Presence Margin
                  </h3>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">100.0%</div>
                  <p className="text-sm font-medium text-zinc-700 leading-snug">
                    System-wide operational tracking mean.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Section: Live System Logs / Streams */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Card left: Recent Student Accession Stream */}
          <Card className="border-zinc-200 bg-white shadow-xs rounded-lg">
            <CardHeader className="space-y-1 p-4 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-zinc-900">
                <Activity className="w-4 h-4 text-zinc-400" />
                <CardTitle className="text-base font-bold tracking-tight">
                  Recent Student Accession Stream
                </CardTitle>
              </div>
              <p className="text-sm font-medium text-zinc-600">
                Chronological logging verification output of new enrollments.
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200/60 rounded-md">
                <div className="space-y-0.5">
                  <h4 className="text-base font-bold text-zinc-900">John Doe</h4>
                  <p className="text-sm font-medium text-zinc-700">10 • Section A</p>
                  <p className="text-xs font-mono text-zinc-500">Roll Token: 12</p>
                </div>
                <Badge variant="secondary" className="bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold px-2 py-0.5">
                  Jun 2
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Card right: Recent Curricula Assignments Taskings */}
          <Card className="border-zinc-200 bg-white shadow-xs rounded-lg">
            <CardHeader className="space-y-1 p-4 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-zinc-900">
                <FileText className="w-4 h-4 text-zinc-400" />
                <CardTitle className="text-base font-bold tracking-tight">
                  Recent Curricula Assignments Taskings
                </CardTitle>
              </div>
              <p className="text-sm font-medium text-zinc-600">
                Monitoring log entries capturing curriculum additions.
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200/60 rounded-md">
                <div className="space-y-0.5">
                  <h4 className="text-base font-bold text-zinc-900">Algebra chapter 5</h4>
                  <p className="text-sm font-medium text-zinc-700">Maths | 10</p>
                  <p className="text-xs font-medium text-zinc-500">Authorized: James Bond</p>
                </div>
                <Badge variant="secondary" className="bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold px-2 py-0.5">
                  Jun 2
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section: System Integrity Setup Index */}
        <Card className="border-zinc-200 bg-white shadow-xs rounded-lg">
          <CardHeader className="space-y-1 p-4 border-b border-zinc-100">
            <CardTitle className="text-base font-bold tracking-tight text-zinc-900">
              System Integrity Setup Index
            </CardTitle>
            <p className="text-sm font-medium text-zinc-600">
              Pipeline map outlining critical infrastructure operational checkpoints.
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid sm:grid-cols-3 gap-3">
              {/* Node 1 */}
              <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-md flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-zinc-900">Classes Node Verified</p>
                  <p className="text-xs font-medium text-zinc-700 leading-snug">
                    1 structured core framework configured properly.
                  </p>
                </div>
              </div>

              {/* Node 2 */}
              <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-md flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-zinc-900">Faculty Registries Clear</p>
                  <p className="text-xs font-medium text-zinc-700 leading-snug">
                    1 authentic identity profile validated.
                  </p>
                </div>
              </div>

              {/* Node 3 */}
              <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-md flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-zinc-900">Student Ledgers Online</p>
                  <p className="text-xs font-medium text-zinc-700 leading-snug">
                    1 user index paired and mapping logs cleanly.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  )
}