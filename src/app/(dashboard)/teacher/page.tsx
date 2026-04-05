'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'
import CardSkeleton from '@/components/ui/CardSkeleton'

type Assignment = {
  id: string
  title: string
  description: string | null
  dueDate: string
  maxMarks: number
  subject: {
    name: string
    class: {
      name: string
      section: string
    }
  }
  _count: {
    submissions: number
  }
}

type Subject = {
  id: string
  name: string
  class: {
    name: string
    section: string
  }
}

export default function TeacherDashboard() {
  const { data: session } = useSession()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    maxMarks: ''
  })

  useEffect(() => {
    fetchAssignments()
    fetchSubjects()
  }, [])

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/assignments')
      const data = await res.json()
      setAssignments(data)
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/teachers/subjects')
      const data = await res.json()
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
  e.preventDefault()
  setError('')

  try {
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (res.ok) {
      setFormData({ title: '', description: '', subjectId: '', dueDate: '', maxMarks: '' })
      setShowForm(false)
      fetchAssignments()
      toast.success('Assignment created successfully! 🎉')
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to create assignment')
    }
  } catch (error) {
    console.error('Error creating assignment:', error)
    toast.error('Error creating assignment')
  }
}

  if (loading) {
    return (
    <DashboardLayout requiredRole="TEACHER">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CardSkeleton count={3} />
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
  }

  return (
    <DashboardLayout requiredRole="TEACHER">
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {/* Header with Create Button */}
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
        <p className="mt-1 text-gray-600">Create and manage assignments for your classes</p>
      </div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transition-all"
      >
        {showForm ? '✕ Cancel' : '+ Create Assignment'}
      </button>
    </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Assignments</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{assignments.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Subjects Teaching</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{subjects.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Submissions</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {assignments.reduce((sum, a) => sum + a._count.submissions, 0)}
            </p>
          </div>
        </div>

        {/* Create Assignment Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Algebra Chapter 5 Exercise"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Assignment details and instructions..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    required
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.class.name} - {subject.class.section})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                    placeholder="e.g., 100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Assignment
              </button>
            </form>
          </div>
        )}

        {/* Assignments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Assignments</h2>
          </div>
          
          {assignments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No assignments yet. Create your first assignment!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <Link 
                  href={`/teacher/assignments/${assignment.id}`}
                  key={assignment.id} 
                  className="p-6 hover:bg-gray-50 block cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {assignment.description || 'No description'}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span>📚 {assignment.subject.name}</span>
                          <span>🏫 {assignment.subject.class.name} - {assignment.subject.class.section}</span>
                          <span>📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          <span>💯 {assignment.maxMarks} marks</span>
                        </div>
                      </div>
                        <div className="ml-4 text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {assignment._count.submissions}
                          </div>
                          <div className="text-xs text-gray-500">submissions</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
          )}
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}