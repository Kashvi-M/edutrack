'use client'

import { useState, useEffect } from 'react'
import GradeChart from '@/components/charts/GradeChart'
import AttendanceCalendar from '@/components/charts/AttendanceCalendar'
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
    teacher: {
      user: {
        name: string
      }
    }
  }
  submissions: Array<{
    id: string
    status: string
    submittedAt: string
    grade: number | null
    feedback: string | null
  }>
}

type AttendanceRecord = {
  id: string
  date: string
  status: string
  teacher: {
    user: {
      name: string
    }
  }
}

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'assignments' | 'attendance'>('assignments')

  useEffect(() => {
    fetchUserName()
    fetchAssignments()
    fetchAttendance()
  }, [])

  const fetchUserName = async () => {
    const res = await fetch('/api/auth/session')
    const data = await res.json()
    if (data?.user?.name) {
      setUserName(data.user.name)
    }
  }

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

  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/attendance')
      const data = await res.json()
      setAttendance(data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const handleSubmit = async (assignmentId: string) => {
  const confirmed = window.confirm('Submit this assignment? You cannot undo this action.')
  if (!confirmed) return

  setSubmitting(assignmentId)

  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId })
    })

    if (res.ok) {
      toast.success('Assignment submitted successfully! ✅')
      fetchAssignments()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to submit assignment')
    }
  } catch (error) {
    console.error('Error submitting assignment:', error)
    toast.error('Error submitting assignment')
  } finally {
    setSubmitting(null)
  }
}

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const getSubmission = (assignment: Assignment) => {
    return assignment.submissions && assignment.submissions.length > 0 
      ? assignment.submissions[0] 
      : null
  }

  // Calculate attendance stats
  const totalDays = attendance.length
  const presentDays = attendance.filter(a => a.status === 'PRESENT').length
  const absentDays = attendance.filter(a => a.status === 'ABSENT').length
  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0'

  // Get recent attendance (last 30 days)
  const recentAttendance = attendance.slice(0, 30)

  if (loading) {
    return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CardSkeleton count={3} />
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
  }

  const pendingAssignments = assignments.filter(a => !getSubmission(a))
  const submittedAssignments = assignments.filter(a => getSubmission(a))

  // Prepare chart data
  const gradeChartData = submittedAssignments
    .filter(a => {
    const submission = getSubmission(a)
    return submission && submission.grade !== null && submission.grade !== undefined
  })
  .map(a => {
    const submission = getSubmission(a)!
    return {
      assignment: a.title.length > 15 ? a.title.substring(0, 15) + '...' : a.title,
      grade: submission.grade!,
      maxMarks: a.maxMarks,
      percentage: (submission.grade! / a.maxMarks) * 100
    }
  })
  .slice(0, 10) // Last 10 assignments

const attendanceChartData = attendance.map(a => ({
  date: a.date,
  status: a.status as 'PRESENT' | 'ABSENT'
}))

  return (
    <DashboardLayout requiredRole="STUDENT">
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex gap-8">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'assignments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📚 Assignments
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📅 Attendance
            </button>
          </nav>
        </div>

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Assignments</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{assignments.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                <p className="mt-2 text-3xl font-bold text-orange-600">{pendingAssignments.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Submitted</h3>
                <p className="mt-2 text-3xl font-bold text-green-600">{submittedAssignments.length}</p>
              </div>
            </div>

            {/* Pending Assignments */}
            {pendingAssignments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Assignments</h2>
                <div className="space-y-4">
                  {pendingAssignments.map((assignment) => {
                    const overdue = isOverdue(assignment.dueDate)
                    return (
                      <div
                        key={assignment.id}
                        className={`bg-white rounded-lg shadow p-6 ${overdue ? 'border-l-4 border-red-500' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {assignment.title}
                              </h3>
                              {overdue && (
                                <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              {assignment.description || 'No description'}
                            </p>
                            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                              <span>📚 {assignment.subject.name}</span>
                              <span>👨‍🏫 {assignment.subject.teacher.user.name}</span>
                              <span className={overdue ? 'text-red-600 font-semibold' : ''}>
                                📅 Due: {new Date(assignment.dueDate).toLocaleString()}
                              </span>
                              <span>💯 {assignment.maxMarks} marks</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSubmit(assignment.id)}
                            disabled={submitting === assignment.id}
                            className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting === assignment.id ? 'Submitting...' : 'Submit Assignment'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Submitted Assignments */}
            {submittedAssignments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Submitted Assignments</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assignment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {submittedAssignments.map((assignment) => {
                        const submission = getSubmission(assignment)
                        if (!submission) return null
                        
                        return (
                          <tr key={assignment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {assignment.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.subject.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(submission.submittedAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {submission.grade !== null && submission.grade !== undefined ? (
                                <span className="font-semibold text-green-600">
                                  {submission.grade} / {assignment.maxMarks}
                                </span>
                              ) : (
                                <span className="text-gray-400">Not graded</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {submission.grade !== null && submission.grade !== undefined ? (
                                <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
                                  GRADED
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded">
                                  SUBMITTED
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {/* GRADE CHART */}
                {gradeChartData.length > 0 && (
                <div className="mb-8">
                  <GradeChart data={gradeChartData} />
                </div>
              )}
              </div>
            )}

            {/* Empty State */}
            {assignments.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">No assignments yet. Check back later!</p>
              </div>
            )}
          </>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <>
            {/* Attendance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Attendance %</h3>
                <p className={`mt-2 text-3xl font-bold ${
                  parseFloat(attendancePercentage) >= 75 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {attendancePercentage}%
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Days</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{totalDays}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Present</h3>
                <p className="mt-2 text-3xl font-bold text-green-600">{presentDays}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Absent</h3>
                <p className="mt-2 text-3xl font-bold text-red-600">{absentDays}</p>
              </div>
            </div>

            {/* Attendance Warning */}
            {parseFloat(attendancePercentage) < 75 && totalDays > 0 && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-red-800">Low Attendance Warning</p>
                    <p className="text-sm text-red-600">
                      Your attendance is below 75%. Please maintain regular attendance.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* CALENDAR CHART */}
            <div className="mb-8">
              <AttendanceCalendar data={attendanceChartData} />
            </div>

            {/* Attendance History */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Attendance</h2>
              </div>

              {attendance.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No attendance records yet
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentAttendance.map((record) => (
                    <div key={record.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            record.status === 'PRESENT' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(record.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-gray-500">
                              Marked by: {record.teacher.user.name}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-semibold rounded ${
                          record.status === 'PRESENT'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    </DashboardLayout>
  )
}