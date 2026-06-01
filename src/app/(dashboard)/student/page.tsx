'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import GradeChart from '@/components/charts/GradeChart'
import AttendanceCalendar from '@/components/charts/AttendanceCalendar'
import toast from 'react-hot-toast'

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

  const totalDays = attendance.length
  const presentDays = attendance.filter(a => a.status === 'PRESENT').length
  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0'

  const pendingAssignments = assignments.filter(a => !getSubmission(a))
  const submittedAssignments = assignments.filter(a => getSubmission(a))

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
    .slice(0, 10)

  const attendanceChartData = attendance.map(a => ({
    date: a.date,
    status: a.status as 'PRESENT' | 'ABSENT'
  }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-base text-slate-600 mt-1">Welcome back, {userName || 'Student'}</p>
            </div>
            <form action="/api/auth/signout" method="POST">
              <Button variant="outline" type="submit" className="text-base">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList className="flex w-full md:w-auto gap-2 p-1 bg-slate-100 rounded-lg">
            <TabsTrigger value="assignments" className="flex-1 text-base py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">📚 Assignments</TabsTrigger>
            <TabsTrigger value="attendance" className="flex-1 text-base py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">📅 Attendance</TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">Total Assignments</CardTitle>
                  <span className="text-2xl">📝</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{assignments.length}</div>
                  <p className="text-sm text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">Pending</CardTitle>
                  <span className="text-2xl">⏳</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{pendingAssignments.length}</div>
                  <p className="text-sm text-muted-foreground">To submit</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">Submitted</CardTitle>
                  <span className="text-2xl">✅</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{submittedAssignments.length}</div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
            </div>

            {/* Pending Assignments */}
            {pendingAssignments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Pending Assignments</CardTitle>
                  <CardDescription className="text-base">Assignments awaiting your submission</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingAssignments.map((assignment) => {
                    const overdue = isOverdue(assignment.dueDate)
                    return (
                      <div
                        key={assignment.id}
                        className={`p-5 border-2 rounded-lg ${overdue ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-slate-900">
                                {assignment.title}
                              </h3>
                              {overdue && (
                                <Badge variant="destructive" className="text-sm">OVERDUE</Badge>
                              )}
                            </div>
                            <p className="text-base text-slate-600">
                              {assignment.description || 'No description'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <Badge variant="secondary" className="text-sm">📚 {assignment.subject.name}</Badge>
                              <Badge variant="outline" className="text-sm">👨‍🏫 {assignment.subject.teacher.user.name}</Badge>
                              <span className={`text-sm ${overdue ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                                📅 Due: {new Date(assignment.dueDate).toLocaleString()}
                              </span>
                              <span className="text-sm text-slate-600">💯 {assignment.maxMarks} marks</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleSubmit(assignment.id)}
                            disabled={submitting === assignment.id}
                            size="lg"
                            className="text-base"
                          >
                            {submitting === assignment.id ? 'Submitting...' : 'Submit'}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {/* Submitted Assignments Table */}
            {submittedAssignments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Submitted Assignments</CardTitle>
                  <CardDescription className="text-base">Your completed assignments and grades</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-base">Assignment</TableHead>
                        <TableHead className="text-base">Subject</TableHead>
                        <TableHead className="text-base">Submitted At</TableHead>
                        <TableHead className="text-base">Grade</TableHead>
                        <TableHead className="text-base">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submittedAssignments.map((assignment) => {
                        const submission = getSubmission(assignment)
                        if (!submission) return null
                        
                        return (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium text-base">{assignment.title}</TableCell>
                            <TableCell className="text-base">{assignment.subject.name}</TableCell>
                            <TableCell className="text-base">{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                            <TableCell className="text-base">
                              {submission.grade !== null && submission.grade !== undefined ? (
                                <span className="font-semibold text-green-600 text-base">
                                  {submission.grade} / {assignment.maxMarks}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-base">Not graded</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {submission.grade !== null && submission.grade !== undefined ? (
                                <Badge className="text-sm">GRADED</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-sm">SUBMITTED</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Grade Chart */}
            {gradeChartData.length > 0 && (
              <GradeChart data={gradeChartData} />
            )}

            {/* Empty State */}
            {assignments.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Assignments Yet</h3>
                  <p className="text-base text-slate-600">Check back later for new assignments from your teachers</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            {/* Attendance Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">Attendance %</CardTitle>
                  <span className="text-2xl">{parseFloat(attendancePercentage) >= 75 ? '✅' : '⚠️'}</span>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${
                    parseFloat(attendancePercentage) >= 75 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {attendancePercentage}%
                  </div>
                  <p className="text-sm text-muted-foreground">Overall</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">Total Days</CardTitle>
                  <span className="text-2xl">📅</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalDays}</div>
                  <p className="text-sm text-muted-foreground">Recorded</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">Present</CardTitle>
                  <span className="text-2xl">✅</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{presentDays}</div>
                  <p className="text-sm text-muted-foreground">Days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">Absent</CardTitle>
                  <span className="text-2xl">❌</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{totalDays - presentDays}</div>
                  <p className="text-sm text-muted-foreground">Days</p>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Warning */}
            {parseFloat(attendancePercentage) < 75 && totalDays > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 text-xl flex items-center gap-2">
                    <span>⚠️</span>
                    Low Attendance Warning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-red-700">
                    Your attendance is below 75%. Please maintain regular attendance to meet academic requirements.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Attendance Calendar */}
            {attendanceChartData.length > 0 && (
              <AttendanceCalendar data={attendanceChartData} />
            )}

            {/* Recent Attendance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Recent Attendance</CardTitle>
                <CardDescription className="text-base">Your attendance history</CardDescription>
              </CardHeader>
              <CardContent>
                {attendance.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📅</div>
                    <p className="text-lg text-muted-foreground">No attendance records yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendance.slice(0, 30).map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${
                              record.status === 'PRESENT' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <p className="font-medium text-base text-slate-900">
                                {new Date(record.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-sm text-slate-500">
                                Marked by: {record.teacher.user.name}
                              </p>
                            </div>
                          </div>
                          <Badge variant={record.status === 'PRESENT' ? 'default' : 'destructive'} className="text-sm">
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}