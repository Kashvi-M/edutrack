'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import TableSkeleton from '@/components/ui/TableSkeleton'

type Class = {
  id: string
  name: string
  section: string
}

type Student = {
  id: string
  rollNumber: string
  user: {
    id: string
    name: string
    email: string
  }
  class: Class | null
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    classId: ''
  })

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students')
      const data = await res.json()
      //Check if data is an array
      if (Array.isArray(data)) {
        setStudents(data)
    } else {
      console.error('Invalid data format:', data)
      setStudents([])
    }
   } catch (error) {
      console.error('Error fetching students:', error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      const data = await res.json()
      setClasses(data)
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setFormData({ name: '', email: '', password: '', rollNumber: '', classId: '' })
        setShowForm(false)
        fetchStudents()
        toast.success('Student created successfully! 🎓')
      } else {
        setError(data.error || 'Failed to create student')
      }
    } catch (error) {
      console.error('Error creating student:', error)
      setError('Error creating student')
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
            <p className="mt-1 text-gray-600">Add and view all students</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Student'}
          </button>
        </div>
        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Student</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Jane Smith"
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
                    placeholder="student@edutrack.com"
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    placeholder="e.g., 2024001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class (Optional)
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} - {cls.section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Student
              </button>
            </form>
          </div>
        )}

        {/* Students List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No students found. Create your first student!
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.class ? `${student.class.name} - ${student.class.section}` : 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-800">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}