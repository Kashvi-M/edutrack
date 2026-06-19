'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  UserCheck, 
  GraduationCap, 
  Users, 
  FolderMinus, 
  Calendar, 
  LogOut 
} from 'lucide-react'

// Explicit map converting original emoji values into sharp Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  '🏠': LayoutDashboard,
  '🏫': BookOpen,
  '👨‍🏫': UserCheck,
  '🎓': GraduationCap,
  '👨‍👩‍👧': Users,
  '📚': FolderMinus,
  '📅': Calendar,
}

type NavItem = {
  name: string
  href: string
  icon: string
}

type Props = {
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'
  userName: string
}

export default function Navbar({ role, userName }: Props) {
  const pathname = usePathname()

  const navItems: Record<string, NavItem[]> = {
    ADMIN: [
      { name: 'Dashboard', href: '/admin', icon: '🏠' },
      { name: 'Classes', href: '/admin/classes', icon: '🏫' },
      { name: 'Teachers', href: '/admin/teachers', icon: '👨‍🏫' },
      { name: 'Students', href: '/admin/students', icon: '🎓' },
      { name: 'Parents', href: '/admin/parents', icon: '👨‍👩‍👧' },
      { name: 'Subjects', href: '/admin/subjects', icon: '📚' },
    ],
    TEACHER: [
      { name: 'Dashboard', href: '/teacher', icon: '🏠' },
      { name: 'Attendance', href: '/teacher/attendance', icon: '📅' },
    ],
    STUDENT: [
      { name: 'Dashboard', href: '/student', icon: '🏠' },
    ],
    PARENT: [
      { name: 'Dashboard', href: '/parent', icon: '🏠' },
    ],
  }

  const items = navItems[role] || []
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Brand Logo and Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link href={`/${role.toLowerCase()}`} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-zinc-900 flex items-center justify-center text-white font-bold text-base">
              E
            </div>
            <span className="text-lg font-bold text-zinc-900 tracking-tight">EduTrack</span>
          </Link>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {items.map((item) => {
              const IconComponent = iconMap[item.icon] || LayoutDashboard
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
                    isActive 
                      ? 'bg-zinc-100 text-zinc-900 font-semibold' 
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        
        {/* Right Side: Identity Badge & Account Dropdown */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs font-mono uppercase bg-zinc-50 border-zinc-200 text-zinc-700 px-2 py-0.5">
            {role}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-hidden">
              <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-white cursor-pointer hover:bg-zinc-800 transition-colors">
                {initials}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 mt-1 border-zinc-200 shadow-sm rounded-md bg-white">
              <DropdownMenuLabel className="text-zinc-900 font-bold text-xs px-2 py-1.5 flex flex-col space-y-0.5">
                <span className="truncate">{userName}</span>
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-medium">{role}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-100" />
              
              {/* Form implementation for native redirection validation handling */}
              <form action="/api/auth/signout" method="POST" className="w-full">
                <DropdownMenuItem asChild>
                  <button 
                    type="submit" 
                    className="w-full flex items-center gap-2 px-2 py-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50 font-semibold text-xs rounded-sm cursor-pointer transition-colors border-none bg-transparent text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile / Tablet Dropdown Link Drawer */}
      <div className="xl:hidden border-t border-zinc-100 bg-zinc-50/50 px-4 py-2 space-y-1">
        {items.map((item) => {
          const IconComponent = iconMap[item.icon] || LayoutDashboard
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-zinc-100 text-zinc-900 font-semibold' 
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {item.name}
            </Link>
          )
        })}
      </div>
    </header>
  )
}