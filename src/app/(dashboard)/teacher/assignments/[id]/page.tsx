'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

type Submission = {
  id: string
  submittedAt: string
  status: string
  grade: number | null
  feedback: string | null
  student: {
    rollNumber: string
    user: {
      name: string
      email: string
    }
  }
}

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
  submissions: Submission[]
}

export default function AssignmentSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null)
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' })

  useEffect(() => {
    fetchAssignment()
  }, [assignmentId])

  const fetchAssignment = async () => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submissions`)
      const data = await res.json()
      console.log('Assignment data:', data) // ADDED THIS LINE
      setAssignment(data)
    } catch (error) {
      console.error('Error fetching assignment:', error)
    } finally {
      setLoading(false)
    }
  }

 const handleGrade = async (submissionId: string) => {
  if (!gradeData.grade) {
    toast.error('Please enter a grade')
    return
  }

  const grade = parseInt(gradeData.grade)
  if (isNaN(grade) || grade < 0 || (assignment && grade > assignment.maxMarks)) {
    toast.error(`Grade must be between 0 and ${assignment?.maxMarks}`)
    return
  }

  try {
    const res = await fetch(`/api/submissions/${submissionId}/grade`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gradeData)
    })

    if (res.ok) {
      toast.success('Graded successfully! 🎯')
      setGradingSubmissionId(null)
      setGradeData({ grade: '', feedback: '' })
      fetchAssignment()
    } else {
      toast.error('Failed to grade submission')
    }
  } catch (error) {
    console.error('Error grading:', error)
    toast.error('Error grading submission')
  }
}

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Assignment not found</p>
      </div>
    )
  }
  const submittedCount = assignment.submissions?.length || 0
  const gradedCount = assignment.submissions?.filter(s => s.grade !== null).length || 0

return (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/teacher" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{assignment.title}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {assignment.subject.name} • {assignment.subject.class.name} - {assignment.subject.class.section}
        </p>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats - 3 Cards Only */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Submitted</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{submittedCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Graded</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{gradedCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
          <p className="mt-2 text-3xl font-bold text-orange-600">{submittedCount - gradedCount}</p>
        </div>
      </div>

      {/* Rest of your code continues here... */}

        {/* Submissions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Submissions</h2>
          </div>

          {assignment.submissions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No submissions yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {assignment.submissions.map((submission) => (
                <div key={submission.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.student.user.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Roll: {submission.student.rollNumber} • {submission.student.user.email}
                      </p>
                      <p className="mt-2 text-sm text-gray-600">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                      
                      {submission.grade !== null ? (
                        <div className="mt-3 p-4 bg-green-50 rounded-lg">
                          <p className="text-sm font-semibold text-green-800">
                            Grade: {submission.grade} / {assignment.maxMarks}
                          </p>
                          {submission.feedback && (
                            <p className="mt-2 text-sm text-gray-700">
                              Feedback: {submission.feedback}
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>

                    <div className="ml-4">
                      {submission.grade === null ? (
                        gradingSubmissionId === submission.id ? (
                          <div className="bg-gray-50 p-4 rounded-lg w-80">
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Grade (out of {assignment.maxMarks})
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max={assignment.maxMarks}
                                  value={gradeData.grade}
                                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Enter grade"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Feedback (Optional)
                                </label>
                                <textarea
                                  value={gradeData.feedback}
                                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Add feedback..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleGrade(submission.id)}
                                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                  Submit Grade
                                </button>
                                <button
                                  onClick={() => {
                                    setGradingSubmissionId(null)
                                    setGradeData({ grade: '', feedback: '' })
                                  }}
                                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setGradingSubmissionId(submission.id)}
                            className="px-6 py-2 bg-white border-r border-zinc-200 text-white rounded-md hover:bg-blue-700"
                          >
                            Grade Now
                          </button>
                        )
                      ) : (
                        <span className="px-4 py-2 text-sm font-semibold text-green-800 bg-green-100 rounded-md">
                          ✓ Graded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}