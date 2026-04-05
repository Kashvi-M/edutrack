import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  // Fetch real stats
  const [classesCount, teachersCount, studentsCount, subjectsCount, assignmentsCount, attendanceCount] = await Promise.all([
    prisma.class.count(),
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.subject.count(),
    prisma.assignment.count(),
    prisma.attendance.count(),
  ])

  // Get recent activities
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

  // Calculate attendance percentage
  const totalAttendance = await prisma.attendance.count()
  const presentCount = await prisma.attendance.count({
    where: { status: 'PRESENT' }
  })
  const attendancePercentage = totalAttendance > 0 
    ? ((presentCount / totalAttendance) * 100).toFixed(1) 
    : '0'

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-2 text-gray-600">Real-time statistics and recent activities</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black-100 text-sm font-medium uppercase tracking-wide">Total Classes</p>
                <p className="text-4xl font-bold mt-2">{classesCount}</p>
              </div>
              <div className="text-5xl opacity-80">🏫</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-300 to-green-400 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black-100 text-sm font-medium uppercase tracking-wide">Total Teachers</p>
                <p className="text-4xl font-bold mt-2">{teachersCount}</p>
              </div>
              <div className="text-5xl opacity-80">👨‍🏫</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-300 to-purple-400 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black-100 text-sm font-medium uppercase tracking-wide">Total Students</p>
                <p className="text-4xl font-bold mt-2">{studentsCount}</p>
              </div>
              <div className="text-5xl opacity-80">🎓</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black-100 text-sm font-medium uppercase tracking-wide">Total Subjects</p>
                <p className="text-4xl font-bold mt-2">{subjectsCount}</p>
              </div>
              <div className="text-5xl opacity-80">📚</div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{assignmentsCount}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Attendance Records</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{attendanceCount}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Overall Attendance</p>
                <p className={`text-3xl font-bold mt-2 ${
                  parseFloat(attendancePercentage) >= 75 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {attendancePercentage}%
                </p>
              </div>
              <div className="text-4xl">
                {parseFloat(attendancePercentage) >= 75 ? '✅' : '⚠️'}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Students */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recently Added Students</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentStudents.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No students added yet
                </div>
              ) : (
                recentStudents.map((student) => (
                  <div key={student.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{student.user.name}</p>
                        <p className="text-sm text-gray-500">
                          {student.class ? `${student.class.name} - ${student.class.section}` : 'No class assigned'} • Roll: {student.rollNumber}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Assignments */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentAssignments.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No assignments created yet
                </div>
              ) : (
                recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{assignment.title}</p>
                        <p className="text-sm text-gray-500">
                          {assignment.subject.name} • {assignment.subject.class.name} - {assignment.subject.class.section}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          By {assignment.subject.teacher.user.name}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">System Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${classesCount > 0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-gray-700">
                    {classesCount > 0 ? 'Classes configured' : 'Set up classes'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${teachersCount > 0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-gray-700">
                    {teachersCount > 0 ? 'Teachers onboarded' : 'Add teachers'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${studentsCount > 0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-gray-700">
                    {studentsCount > 0 ? 'Students enrolled' : 'Enroll students'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}