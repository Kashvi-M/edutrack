'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
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
  const [dataLoading, setDataLoading] = useState(false)
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

      const parentRes = await fetch('/api/parents/me')
      const parentData = await parentRes.json()
      
      if (parentData?.students && parentData.students.length > 0) {
        setChildren(parentData.students)
        setSelectedChildId(parentData.students[0].id)
      }
    } catch (error) {
      console.error('Error fetching parent data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChildData = async (studentId: string) => {
    try {
      setDataLoading(true)
      
      const assignmentsRes = await fetch(`/api/parents/child/${studentId}/assignments`)
      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json()
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      } else {
        setAssignments([])
      }

      const attendanceRes = await fetch(`/api/parents/child/${studentId}/attendance`)
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json()
        setAttendance(Array.isArray(attendanceData) ? attendanceData : [])
      } else {
        setAttendance([])
      }
    } catch (error) {
      console.error('Error fetching child data:', error)
      setAssignments([])
      setAttendance([])
    } finally {
      setDataLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout requiredRole="PARENT">
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (children.length === 0) {
    return (
      <DashboardLayout requiredRole="PARENT">
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">No Children Linked</h2>
              <p className="text-lg text-slate-600 mb-6 text-center max-w-md">
                No students are currently linked to your parent account.
              </p>
              <Card className="bg-blue-50 border-blue-200 max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-blue-900 text-xl">What to do?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-blue-800">
                    Please contact the school administrator to link your child's account to your parent profile.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const selectedChild = children.find(c => c.id === selectedChildId)
  
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

  const gradeData = assignments
    .filter(a => a.submissions.length > 0 && a.submissions[0].grade !== null)
    .slice(0, 10)
    .map(a => ({
      assignment: a.title.length > 15 ? a.title.substring(0, 15) + '...' : a.title,
      grade: a.submissions[0].grade!,
      maxMarks: a.maxMarks,
      percentage: (a.submissions[0].grade! / a.maxMarks) * 100
    }))

  const attData = attendance.map(a => ({
    date: a.date,
    status: a.status as 'PRESENT' | 'ABSENT'
  }))

  return (
    <DashboardLayout requiredRole="PARENT">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
          <p className="text-base text-muted-foreground mt-1">Monitor your child's academic progress</p>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Select Child</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedChildId}
                onValueChange={(value) => setSelectedChildId(value)}
              >
                <SelectTrigger className="w-full md:w-1/2 h-11 text-base">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id} className="text-base">
                      {child.user.name} - {child.class ? `${child.class.name} ${child.class.section}` : 'No class'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {selectedChild && (
          <>
            {/* Child Info Banner */}
            <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-5xl">
                    🎓
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{selectedChild.user.name}</h2>
                    <p className="text-lg text-blue-100">Roll Number: {selectedChild.rollNumber}</p>
                    <p className="text-lg text-blue-100">
                      {selectedChild.class 
                        ? `${selectedChild.class.name} - ${selectedChild.class.section}` 
                        : 'No class assigned'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">Attendance</CardTitle>
                  <span className="text-2xl">{parseFloat(attendancePercentage) >= 75 ? '✅' : '⚠️'}</span>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${
                    parseFloat(attendancePercentage) >= 75 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {attendancePercentage}%
                  </div>
                  <p className="text-sm text-muted-foreground">{presentDays} / {totalDays} days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">Assignments</CardTitle>
                  <span className="text-2xl">📝</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalAssignments}</div>
                  <p className="text-sm text-muted-foreground">{submittedAssignments} submitted</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">Graded</CardTitle>
                  <span className="text-2xl">✅</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{gradedAssignments}</div>
                  <p className="text-sm text-muted-foreground">assignments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">Average Score</CardTitle>
                  <span className="text-2xl">📊</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{averageGrade}%</div>
                  <p className="text-sm text-muted-foreground">across subjects</p>
                </CardContent>
              </Card>
            </div>

            {/* Low Attendance Warning */}
            {parseFloat(attendancePercentage) < 75 && totalDays > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 text-xl flex items-center gap-2">
                    <span>⚠️</span>
                    Low Attendance Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-red-700">
                    Your child's attendance is below 75%. Please ensure regular attendance.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Performance Charts */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Performance Overview</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                {gradeData.length > 0 ? (
                  <GradeChart data={gradeData} />
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <div className="text-5xl mb-3">📊</div>
                      <p className="text-lg text-muted-foreground">No grades available yet</p>
                    </CardContent>
                  </Card>
                )}

                {attData.length > 0 ? (
                  <AttendanceCalendar data={attData} />
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <div className="text-5xl mb-3">📅</div>
                      <p className="text-lg text-muted-foreground">No attendance data yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Recent Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Recent Assignments</CardTitle>
                <CardDescription className="text-base">Latest assignment activity</CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">📚</div>
                    <p className="text-lg text-muted-foreground">No assignments yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-base">Assignment</TableHead>
                        <TableHead className="text-base">Subject</TableHead>
                        <TableHead className="text-base">Due Date</TableHead>
                        <TableHead className="text-base">Status</TableHead>
                        <TableHead className="text-base">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.slice(0, 10).map((assignment) => {
                        const submission = assignment.submissions[0]
                        return (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium text-base">{assignment.title}</TableCell>
                            <TableCell className="text-base">{assignment.subject.name}</TableCell>
                            <TableCell className="text-base">
                              {new Date(assignment.dueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {submission ? (
                                <Badge className="text-sm">Submitted</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-sm">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-base">
                              {submission && submission.grade !== null ? (
                                <span className="font-semibold text-green-600">
                                  {submission.grade} / {assignment.maxMarks}
                                </span>
                              ) : (
                                <span className="text-slate-400">Not graded</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Recent Attendance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Recent Attendance</CardTitle>
                <CardDescription className="text-base">Last 10 attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                {attendance.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">📅</div>
                    <p className="text-lg text-muted-foreground">No attendance records yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {attendance.slice(0, 10).map((record, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-2 ${
                          record.status === 'PRESENT'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <p className="text-sm text-slate-600">
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className={`text-base font-semibold ${
                          record.status === 'PRESENT' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {record.status}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}