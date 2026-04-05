'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

type Student = {
  id: string
  rollNumber: string
  user: {
    name: string
  }
}

type Class = {
  id: string
  name: string
  section: string
  students: Student[]
}

type AttendanceRecord = {
  [studentId: string]: 'PRESENT' | 'ABSENT'
}

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState<AttendanceRecord>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchTeacherClasses()
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      const cls = classes.find(c => c.id === selectedClassId)
      setSelectedClass(cls || null)
      
      if (cls) {
        // Initialize all students as PRESENT by default
        const initialAttendance: AttendanceRecord = {}
        cls.students.forEach(student => {
          initialAttendance[student.id] = 'PRESENT'
        })
        setAttendance(initialAttendance)
      }
    }
  }, [selectedClassId, classes])

  const fetchTeacherClasses = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/teachers/subjects')
      const subjects = await res.json()
      
      // Get unique classes from subjects
      const uniqueClasses = Array.from(
        new Map(subjects.map((s: any) => [s.class.id, s.class])).values()
      )

      // Fetch students for each class
      const classesWithStudents = await Promise.all(
        uniqueClasses.map(async (cls: any) => {
          const studentsRes = await fetch(`/api/students?classId=${cls.id}`)
          const allStudents = await studentsRes.json()
          const classStudents = allStudents.filter((s: any) => s.classId === cls.id)
          return { ...cls, students: classStudents }
        })
      )

      setClasses(classesWithStudents)
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleSubmit = async () => {
  if (!selectedClass || !date) {
    toast.error('Please select a class and date')
    return
  }

  setSaving(true)
  setShowSuccess(false)

  const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
    studentId,
    status
  }))

  try {
    const res = await fetch('/api/attendance/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attendanceRecords,
        date
      })
    })

    if (res.ok) {
      toast.success('Attendance marked successfully!', {
        duration: 4000,
      })
      setShowSuccess(true)
      
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
      
      setTimeout(() => {
        setSelectedClassId('')
        setSelectedClass(null)
        setAttendance({})
        setDate(new Date().toISOString().split('T')[0])
      }, 1500)
      
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      toast.error('Failed to mark attendance')
    }
  } catch (error) {
    console.error('Error marking attendance:', error)
    toast.error('Error marking attendance')
  } finally {
    setSaving(false)
  }
}
  const presentCount = Object.values(attendance).filter(s => s === 'PRESENT').length
  const absentCount = Object.values(attendance).filter(s => s === 'ABSENT').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/teacher" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Mark Attendance</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <p className="font-semibold text-green-800 text-lg">Attendance Saved Successfully!</p>
                <p className="text-sm text-green-600 mt-1">
                  Attendance for {selectedClass?.name} - {selectedClass?.section} on {new Date(date).toLocaleDateString()} has been recorded.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-600 hover:text-green-800 font-bold text-xl px-2"
            >
              ✕
            </button>
          </div>
        )}
        {/* Stats Only */}
{selectedClass && (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <div className="flex gap-8">
      <div>
        <p className="text-sm text-gray-500">Total Students</p>
        <p className="text-2xl font-bold text-gray-900">{selectedClass.students.length}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Present</p>
        <p className="text-2xl font-bold text-green-600">{presentCount}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Absent</p>
        <p className="text-2xl font-bold text-red-600">{absentCount}</p>
      </div>
    </div>
  </div>
)}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Choose a class...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.section} ({cls.students.length} students)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSubmit}
                disabled={!selectedClass || saving}
                className={`w-full px-6 py-2 rounded-md font-semibold transition-all ${
                  showSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Saving...
                  </span>
                ) : showSuccess ? (
                  '✓ Saved!'
                ) : (
                  'Save Attendance'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Attendance List */}
        {selectedClass && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedClass.name} - {selectedClass.section}
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {selectedClass.students.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No students in this class
                </div>
              ) : (
                selectedClass.students.map((student) => (
                  <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{student.user.name}</p>
                        <p className="text-sm text-gray-500">Roll: {student.rollNumber}</p>
                      </div>

                      {/* Two Button Style */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleStatusChange(student.id, 'PRESENT')}
                          className={`px-6 py-2 rounded-md border-2 font-medium transition-all ${
                            attendance[student.id] === 'PRESENT'
                              ? 'bg-green-500 text-white border-green-600 shadow-md'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                          }`}
                        >
                          ✓ Present
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(student.id, 'ABSENT')}
                          className={`px-6 py-2 rounded-md border-2 font-medium transition-all ${
                            attendance[student.id] === 'ABSENT'
                              ? 'bg-red-500 text-white border-red-600 shadow-md'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
                          }`}
                        >
                          ✗ Absent
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedClass && !loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Class Selected</h3>
            <p className="text-gray-600">Select a class and date above to mark attendance</p>
          </div>
        )}
      </div>
    </div>
  )
}