import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const [classesCount, teachersCount, studentsCount, subjectsCount, assignmentsCount, attendanceCount] = await Promise.all([
    prisma.class.count(),
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.subject.count(),
    prisma.assignment.count(),
    prisma.attendance.count(),
  ])

  const recentStudents = await prisma.student.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      class: true
    }
  })

  const recentAssignments = await prisma.assignment.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      subject: {
        include: {
          class: true,
          teacher: {
            include: {
              user: true
            }
          }
        }
      }
    }
  })

  const totalAttendance = await prisma.attendance.count()
  const presentCount = await prisma.attendance.count({
    where: { status: 'PRESENT' }
  })
  const attendancePercentage = totalAttendance > 0 
    ? ((presentCount / totalAttendance) * 100).toFixed(1) 
    : '0'

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="container mx-auto p-8 space-y-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-xl text-slate-600">
            Here's what's happening in your school today
          </p>
        </div>

        <Separator className="my-8" />

        {/* Main Statistics - Clean 4 Column Grid */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Overview Statistics</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-slate-600">Classes</CardTitle>
                  <div className="text-4xl">🏫</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-black">{classesCount}</div>
                <p className="text-base text-slate-500 mt-2">Total active classes</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-slate-600">Teachers</CardTitle>
                  <div className="text-4xl">👨‍🏫</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-black">{teachersCount}</div>
                <p className="text-base text-slate-500 mt-2">Teaching staff members</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-slate-600">Students</CardTitle>
                  <div className="text-4xl">🎓</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-black">{studentsCount}</div>
                <p className="text-base text-slate-500 mt-2">Enrolled students</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-slate-600">Subjects</CardTitle>
                  <div className="text-4xl">📚</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-black">{subjectsCount}</div>
                <p className="text-base text-slate-500 mt-2">Active subjects</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Academic Activity - Cleaner Layout */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Academic Activity</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">📝</div>
                  <div>
                    <CardTitle className="text-xl">Assignments</CardTitle>
                    <CardDescription className="text-base mt-1">Total created</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900">{assignmentsCount}</div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">📅</div>
                  <div>
                    <CardTitle className="text-xl">Attendance</CardTitle>
                    <CardDescription className="text-base mt-1">Total records</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900">{attendanceCount}</div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">
                    {parseFloat(attendancePercentage) >= 75 ? '✅' : '⚠️'}
                  </div>
                  <div>
                    <CardTitle className="text-xl">Attendance Rate</CardTitle>
                    <CardDescription className="text-base mt-1">Overall average</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold ${
                  parseFloat(attendancePercentage) >= 75 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {attendancePercentage}%
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Recent Activity - Side by Side */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Recent Activity</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Students */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="text-2xl">🎓</span>
                  Recently Added Students
                </CardTitle>
                <CardDescription className="text-base">Latest student registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {recentStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-lg text-slate-500">No students added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex-1">
                          <p className="text-base font-semibold text-slate-900">{student.user.name}</p>
                          <p className="text-base text-slate-600">
                            {student.class ? `${student.class.name} - ${student.class.section}` : 'No class assigned'}
                          </p>
                          <p className="text-sm text-slate-500">Roll: {student.rollNumber}</p>
                        </div>
                        <Badge variant="outline" className="text-sm">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Assignments */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Recent Assignments
                </CardTitle>
                <CardDescription className="text-base">Latest assignments created</CardDescription>
              </CardHeader>
              <CardContent>
                {recentAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-lg text-slate-500">No assignments created yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex-1">
                          <p className="text-base font-semibold text-slate-900">{assignment.title}</p>
                          <p className="text-base text-slate-600">
                            {assignment.subject.name} • {assignment.subject.class.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            By {assignment.subject.teacher.user.name}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-sm">
                          {new Date(assignment.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* System Setup Status */}
        <Card className="border-2 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <span className="text-3xl">⚙️</span>
              System Setup Status
            </CardTitle>
            <CardDescription className="text-base">Track your school management setup progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                  classesCount > 0 ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {classesCount > 0 ? 'Classes Configured ✓' : 'Set Up Classes'}
                  </p>
                  <p className="text-base text-slate-600 mt-1">
                    {classesCount > 0 
                      ? `${classesCount} classes are active and ready` 
                      : 'Create your first class to get started'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                  teachersCount > 0 ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {teachersCount > 0 ? 'Teachers Onboarded ✓' : 'Add Teachers'}
                  </p>
                  <p className="text-base text-slate-600 mt-1">
                    {teachersCount > 0 
                      ? `${teachersCount} teachers are in the system` 
                      : 'Add teaching staff to your school'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                  studentsCount > 0 ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {studentsCount > 0 ? 'Students Enrolled ✓' : 'Enroll Students'}
                  </p>
                  <p className="text-base text-slate-600 mt-1">
                    {studentsCount > 0 
                      ? `${studentsCount} students are enrolled` 
                      : 'Start enrolling students to classes'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}