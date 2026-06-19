'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import GradeChart from '@/components/charts/GradeChart'
import AttendanceCalendar from '@/components/charts/AttendanceCalendar'
import { 
  GraduationCap, 
  Calendar, 
  FileText, 
  CheckCircle, 
  BarChart3, 
  AlertTriangle, 
  Users 
} from 'lucide-react'

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
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      </DashboardLayout>
    )
  }

  if (children.length === 0) {
    return (
      <DashboardLayout requiredRole="PARENT">
        <div className="container mx-auto p-6 max-w-4xl">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Children Linked</h2>
              <p className="text-sm text-slate-500 mb-8 text-center max-w-sm">
                No students are currently linked to your parent account.
              </p>
              <Card className="bg-slate-50 border-slate-200 max-w-xl shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-900 text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Please contact the school administrator office to securely verify and link your child's student record to this parent profile hub.
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
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Academic Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Real-time performance tracking and tracking updates.</p>
          </div>

          {/* Child Selector Box */}
          {children.length > 1 && (
            <div className="w-full md:w-64">
              <Select
                value={selectedChildId}
                onValueChange={(value) => setSelectedChildId(value)}
              >
                <SelectTrigger className="w-full h-10 text-sm bg-white border-slate-200">
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id} className="text-sm">
                      {child.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {selectedChild && (
          <>
            {/* Bold Blue Professional Accent Profile Box */}
            <div className="bg-slate-900 text-white rounded-xl border border-slate-800 shadow-sm overflow-hidden relative">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none hidden md:block" />
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 flex-shrink-0">
                    <GraduationCap className="h-7 w-7" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Active Profile</span>
                    <h2 className="text-2xl font-bold tracking-tight mt-0.5">{selectedChild.user.name}</h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-400">
                      <p>ID: <span className="text-slate-200 font-medium">{selectedChild.rollNumber}</span></p>
                      <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
                      <p>Designation: <span className="text-slate-200 font-medium">
                        {selectedChild.class ? `${selectedChild.class.name} - Class Section ${selectedChild.class.section}` : 'Unassigned'}
                      </span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Metrics Layout */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Attendance Rate</CardTitle>
                  <Calendar className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold tracking-tight ${
                    parseFloat(attendancePercentage) >= 75 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {attendancePercentage}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{presentDays} of {totalDays} operational days</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Coursework load</CardTitle>
                  <FileText className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight text-slate-900">{totalAssignments}</div>
                  <p className="text-xs text-slate-500 mt-1">{submittedAssignments} files delivered cleanly</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Evaluated Tasks</CardTitle>
                  <CheckCircle className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight text-blue-600">{gradedAssignments}</div>
                  <p className="text-xs text-slate-500 mt-1">Confirmed grade marks issued</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weighted Average</CardTitle>
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight text-slate-900">{averageGrade}%</div>
                  <p className="text-xs text-slate-500 mt-1">Cumulative score margin</p>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Alert Warning */}
            {parseFloat(attendancePercentage) < 75 && totalDays > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-rose-900 text-sm">Critical Attendance Margin Warning</h5>
                  <p className="text-xs text-rose-700 mt-0.5">The student profile status marks metric points below the 75% institutional compliance requirement threshold. Please arrange verification review.</p>
                </div>
              </div>
            )}

            {/* Performance Overviews */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-950 tracking-tight">Performance Graphics</h3>
              <div className="grid gap-6 lg:grid-cols-2">
                {gradeData.length > 0 ? (
                  <GradeChart data={gradeData} />
                ) : (
                  <Card className="border-slate-200 shadow-sm flex items-center justify-center py-12">
                    <CardContent className="text-center">
                      <BarChart3 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No chart data records map securely</p>
                    </CardContent>
                  </Card>
                )}

                {attData.length > 0 ? (
                  <AttendanceCalendar data={attData} />
                ) : (
                  <Card className="border-slate-200 shadow-sm flex items-center justify-center py-12">
                    <CardContent className="text-center">
                      <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No active tracking matrices filed</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Data Tables Ledger Section */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg font-bold text-slate-950">Coursework Registries</CardTitle>
                <CardDescription className="text-xs">Comprehensive operational task logging analytics overview matrix logs.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {assignments.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No assignments log array registered</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Task Document</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Subject Core</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Expirations</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Status</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500 text-right">Evaluations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.slice(0, 10).map((assignment) => {
                        const submission = assignment.submissions[0]
                        return (
                          <TableRow key={assignment.id} className="hover:bg-slate-50/70 transition-colors">
                            <TableCell className="font-medium text-slate-900 text-sm">{assignment.title}</TableCell>
                            <TableCell className="text-slate-600 text-sm">{assignment.subject.name}</TableCell>
                            <TableCell className="text-slate-500 text-sm">
                              {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </TableCell>
                            <TableCell>
                              {submission ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium shadow-none text-xs" variant="outline">Delivered</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium shadow-none text-xs">Outstanding</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-right">
                              {submission && submission.grade !== null ? (
                                <span className="font-semibold text-slate-900">
                                  {submission.grade} <span className="text-slate-400 font-normal">/ {assignment.maxMarks}</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs">Awaiting Entry</span>
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

            {/* Attendance Track Blocks */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg font-bold text-slate-950">Chronological Event Logs</CardTitle>
                <CardDescription className="text-xs">Sequential review stream monitoring check points.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {attendance.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No sequential ledger checks initialized</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                    {attendance.slice(0, 10).map((record, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          record.status === 'PRESENT'
                            ? 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50'
                            : 'bg-rose-50/50 border-rose-100 hover:bg-rose-50'
                        }`}
                      >
                        <p className="text-xs font-medium text-slate-500">
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className={`text-xs font-bold uppercase mt-1 tracking-wider ${
                          record.status === 'PRESENT' ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {record.status === 'PRESENT' ? 'Pres' : 'Abs'}
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