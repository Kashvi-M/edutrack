'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'
import TableSkeleton from '@/components/ui/TableSkeleton'

type Teacher = {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  _count: {
    subjects: number
    classes: number
  }
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers')
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setTeachers(data)
      } else {
        console.error('Teachers API error:', data)
        setTeachers([])
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setFormData({ name: '', email: '', password: '' })
        setShowForm(false)
        fetchTeachers()
        toast.success('Teacher created successfully! 👨‍🏫')
      } else {
        setError(data.error || 'Failed to create teacher')
      }
    } catch (error) {
      console.error('Error creating teacher:', error)
      setError('Error creating teacher')
    }
  }

  if (loading) {
    return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse"></div>
        </div>
        <TableSkeleton rows={5} columns={4} />
      </div>
    </DashboardLayout>
  )
  }

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Teachers</h1>
            <p className="mt-1 text-gray-600">Add and view all teachers</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Teacher'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Teacher</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@edutrack.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Teacher
              </button>
            </form>
          </div>
        )}

        {/* Teachers List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No teachers found. Create your first teacher!
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {teacher.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher._count.subjects}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher._count.classes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}