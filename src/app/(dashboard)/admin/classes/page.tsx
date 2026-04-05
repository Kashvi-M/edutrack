'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'
import TableSkeleton from '@/components/ui/TableSkeleton' 

type Class = {
  id: string
  name: string
  section: string
  academicYear: string
  teacher: {
    user: {
      name: string
    }
  } | null
  _count: {
    students: number
  }
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    academicYear: '2024-2025'
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      const data = await res.json()
      
      // Check if data is an array
      if (Array.isArray(data)) {
        setClasses(data)
      } else {
        console.error('Classes API error:', data)
        setClasses([])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
    if (res.ok) {
      setFormData({ name: '', section: '', academicYear: '2024-2025' })
      setShowForm(false)
      fetchClasses()
      toast.success('Class created successfully! 🏫')
    } else {
      toast.error('Failed to create class')
   }
    } catch (error) {
      console.error('Error creating class:', error)
      toast.error('Error creating class')
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
        <TableSkeleton rows={5} columns={5} />
      </div>
    </DashboardLayout>
  )
  }

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Classes</h1>
            <p className="mt-1 text-gray-600">Add and view all classes</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Class'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Class</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Class 10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="e.g., A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="e.g., 2024-2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Class
              </button>
            </form>
          </div>
        )}

        {/* Classes List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No classes found. Create your first class!
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cls.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cls.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cls.academicYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cls.teacher?.user.name || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cls._count.students}
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