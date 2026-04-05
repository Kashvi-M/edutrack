'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import GradeChart from '@/components/charts/GradeChart'
import AttendanceCalendar from '@/components/charts/AttendanceCalendar'

type Student = {
  id: string
  rollNumber: string
  user: {
    name: string
    email: string
  }
  class: {
    name: string
    section: string
  } | null
}

type Assignment = {
  id: string
  title: string
  dueDate: string
  maxMarks: number
  subject: {
    name: string
  }
  submissions: Array<{
    grade: number | null
    status: string
    submittedAt: string
  }>
}

type AttendanceRecord = {
  date: string
  status: string
}

export default function ParentDashboard() {
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false) // Add this
  const [userName, setUserName] = useState('')
  const [children, setChildren] = useState<Student[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    fetchParentData()
  }, [])

  useEffect(() => {
    if (selectedChildId) {
      fetchChildData(selectedChildId)
    }
  }, [selectedChildId])

  const fetchParentData = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session')
      const sessionData = await sessionRes.json()
      
      if (sessionData?.user?.name) {
        setUserName(sessionData.user.name)
      }

      // Fetch parent's children
      const parentRes = await fetch('/api/parents/me')
      const parentData = await parentRes.json()
      
      if (parentData?.students && parentData.students.length > 0) {
        setChildren(parentData.students)
        setSelectedChildId(parentData.students[0].id) // Auto-select first child
      }
    } catch (error) {
      console.error('Error fetching parent data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChildData = async (studentId: string) => {
  try {
    setLoading(true)
    
    // Fetch assignments
    const assignmentsRes = await fetch(`/api/parents/child/${studentId}/assignments`)
    if (assignmentsRes.ok) {
      const assignmentsData = await assignmentsRes.json()
      console.log('Assignments data:', assignmentsData) // Debug log
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
    } else {
      setAssignments([])
    }

    // Fetch attendance
    const attendanceRes = await fetch(`/api/parents/child/${studentId}/attendance`)
    if (attendanceRes.ok) {
      const attendanceData = await attendanceRes.json()
      console.log('Attendance data:', attendanceData) // Debug log
      setAttendance(Array.isArray(attendanceData) ? attendanceData : [])
    } else {
      setAttendance([])
    }
  } catch (error) {
    console.error('Error fetching child data:', error)
    setAssignments([])
    setAttendance([])
  } finally {
    setLoading(false)
  }
}

  if (loading) {
    return (
      <DashboardLayout requiredRole="PARENT">
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (children.length === 0) {
    return (
      <DashboardLayout requiredRole="PARENT">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Children Linked</h2>
            <p className="text-gray-600 mb-6">
              No students are currently linked to your parent account.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">What to do?</h3>
              <p className="text-sm text-blue-700">
                Please contact the school administrator to link your child's account to your parent profile.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const selectedChild = children.find(c => c.id === selectedChildId)
  
  // Calculate stats
  const totalAssignments = assignments.length
  const submittedAssignments = assignments.filter(a => a.submissions.length > 0).length
  const gradedAssignments = assignments.filter(a => 
    a.submissions.length > 0 && a.submissions[0].grade !== null
  ).length

  const totalDays = attendance.length
  const presentDays = attendance.filter(a => a.status === 'PRESENT').length
  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0'

  const averageGrade = gradedAssignments > 0
    ? (assignments
        .filter(a => a.submissions.length > 0 && a.submissions[0].grade !== null)
        .reduce((sum, a) => sum + ((a.submissions[0].grade! / a.maxMarks) * 100), 0) / gradedAssignments
      ).toFixed(1)
    : '0'

  return (
    <DashboardLayout requiredRole="PARENT">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Child Selector */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Parent Dashboard</h1>
          
          {children.length > 1 && (
            <div className="bg-white rounded-lg shadow p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Child
              </label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.user.name} - {child.class ? `${child.class.name} ${child.class.section}` : 'No class'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedChild && (
          <>
            {/* Child Info Card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
              <div className="flex items-center gap-4">
                <div className="text-6xl">🎓</div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedChild.user.name}</h2>
                  <p className="text-blue-100">Roll Number: {selectedChild.rollNumber}</p>
                  <p className="text-blue-100">
                    {selectedChild.class 
                      ? `${selectedChild.class.name} - ${selectedChild.class.section}` 
                      : 'No class assigned'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Attendance</h3>
                <p className={`mt-2 text-3xl font-bold ${
                  parseFloat(attendancePercentage) >= 75 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {attendancePercentage}%
                </p>
                <p className="text-xs text-gray-500 mt-1">{presentDays} / {totalDays} days</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Assignments</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{totalAssignments}</p>
                <p className="text-xs text-gray-500 mt-1">{submittedAssignments} submitted</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Graded</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">{gradedAssignments}</p>
                <p className="text-xs text-gray-500 mt-1">assignments graded</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600">{averageGrade}%</p>
                <p className="text-xs text-gray-500 mt-1">across all subjects</p>
              </div>
            </div>

            {/* Attendance Warning */}
            {parseFloat(attendancePercentage) < 75 && totalDays > 0 && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-red-800">Low Attendance Alert</p>
                    <p className="text-sm text-red-600">
                      Your child's attendance is below 75%. Please ensure regular attendance.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Grade Performance Chart */}
              <div>
              {(() => {
                const gradeChartData = assignments
                .filter(a => a.submissions.length > 0 && a.submissions[0].grade !== null)
                .map(a => ({
                assignment: a.title.length > 15 ? a.title.substring(0, 15) + '...' : a.title,
                grade: a.submissions[0].grade!,
                maxMarks: a.maxMarks,
                percentage: (a.submissions[0].grade! / a.maxMarks) * 100
              }))
              .slice(0, 10)

              return gradeChartData.length > 0 ? (
              <GradeChart data={gradeChartData} />
              ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-500">No grades available yet</p>
              </div>
              )
              })()}
            </div>

        {/* Attendance Calendar */}
  <div>
    {(() => {
      const attendanceChartData = attendance.map(a => ({
        date: a.date,
        status: a.status as 'PRESENT' | 'ABSENT'
      }))

      return attendanceChartData.length > 0 ? (
        <AttendanceCalendar data={attendanceChartData} />
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-gray-500">No attendance records yet</p>
        </div>
      )
    })()}
  </div>
</div>

            {/* Recent Assignments */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No assignments yet
                        </td>
                      </tr>
                    ) : (
                      assignments.slice(0, 10).map((assignment) => {
                        const submission = assignment.submissions[0]
                        return (
                          <tr key={assignment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {assignment.title}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {assignment.subject.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(assignment.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {submission ? (
                                <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                                  Submitted
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {submission && submission.grade !== null ? (
                                <span className="font-semibold text-green-600">
                                  {submission.grade} / {assignment.maxMarks}
                                </span>
                              ) : (
                                <span className="text-gray-400">Not graded</span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Attendance */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Attendance (Last 10 Days)</h2>
              </div>
              <div className="p-6">
                {attendance.length === 0 ? (
                  <p className="text-center text-gray-500">No attendance records yet</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {attendance.slice(0, 10).map((record, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border-2 ${
                          record.status === 'PRESENT'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <p className="text-xs text-gray-600">
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className={`text-sm font-semibold ${
                          record.status === 'PRESENT' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {record.status}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}