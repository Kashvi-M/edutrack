'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href={`/${role.toLowerCase()}`} className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                E
              </div>
              <span className="text-xl font-bold text-slate-900 hidden sm:inline">EduTrack</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant={isActive ? "secondary" : "ghost"} 
                      size="sm"
                      className={`text-base font-medium ${isActive ? "bg-slate-100" : ""}`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:flex">{role}</Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <form action="/api/auth/signout" method="POST">
                  <DropdownMenuItem asChild>
                    <button type="submit" className="w-full cursor-pointer">
                      Logout
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden pb-3 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  size="sm"
                  className="w-full justify-start text-base font-medium"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}