'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
    { name: 'Parents', href: '/admin/parents', icon: '👨‍👩‍👧' },  // ADDED THIS
    { name: 'Subjects', href: '/admin/subjects', icon: '📚' },
  ],
  TEACHER: [
    { name: 'Dashboard', href: '/teacher', icon: '🏠' },
    { name: 'Attendance', href: '/teacher/attendance', icon: '📅' },  // FIXED - removed duplicate
  ],
  STUDENT: [
    { name: 'Dashboard', href: '/student', icon: '🏠' },
  ],
  PARENT: [
    { name: 'Dashboard', href: '/parent', icon: '🏠' },
  ],
}

  const items = navItems[role] || []

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href={`/${role.toLowerCase()}`} className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">📚</div>
              <span className="text-xl font-bold text-gray-900">EduTrack</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {items.map((item) => {
  const isActive = pathname === item.href
  return (
    <Link
      key={item.href}
      href={item.href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className="mr-2">{item.icon}</span>
      {item.name}
    </Link>
  )
})}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
  onClick={async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/login'
  }}
  type="button"
  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
>
  Logout
</button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-4 py-3 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}