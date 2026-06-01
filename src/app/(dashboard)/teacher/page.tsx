'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import CardSkeleton from '@/components/ui/CardSkeleton'
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
        <div className="container mx-auto p-6">
          <CardSkeleton count={3} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="TEACHER">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
            <p className="text-muted-foreground text-base mt-1">Create and manage assignments for your classes</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            size="lg"
            className="text-base"
          >
            {showForm ? '✕ Cancel' : '+ Create Assignment'}
          </Button>
        </div>

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
              <CardTitle className="text-base font-medium">Subjects Teaching</CardTitle>
              <span className="text-2xl">📚</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subjects.length}</div>
              <p className="text-sm text-muted-foreground">Active subjects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Total Submissions</CardTitle>
              <span className="text-2xl">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {assignments.reduce((sum, a) => sum + a._count.submissions, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Received</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Assignment Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create New Assignment</CardTitle>
              <CardDescription className="text-base">Fill in the details to create a new assignment</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base">Title</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Algebra Chapter 5 Exercise"
                    className="h-11 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Assignment details and instructions..."
                    rows={4}
                    className="text-base resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-base">Subject</Label>
                    <Select
                      value={formData.subjectId}
                      onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                    >
                      <SelectTrigger className="h-11 text-base">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id} className="text-base">
                            {subject.name} ({subject.class.name} - {subject.class.section})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-base">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="h-11 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxMarks" className="text-base">Max Marks</Label>
                    <Input
                      id="maxMarks"
                      type="number"
                      required
                      min="1"
                      value={formData.maxMarks}
                      onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                      placeholder="e.g., 100"
                      className="h-11 text-base"
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="text-base">
                  Create Assignment
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Assignments</CardTitle>
            <CardDescription className="text-base">View and manage all your assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-lg text-muted-foreground">No assignments yet. Create your first assignment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-5 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/teacher/assignments/${assignment.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {assignment.title}
                        </h3>
                        <p className="text-base text-slate-600 mb-3">
                          {assignment.description || 'No description'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <Badge variant="secondary" className="text-sm">📚 {assignment.subject.name}</Badge>
                          <Badge variant="outline" className="text-sm">
                            🏫 {assignment.subject.class.name} - {assignment.subject.class.section}
                          </Badge>
                          <span className="text-sm">📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          <span className="text-sm">💯 {assignment.maxMarks} marks</span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {assignment._count.submissions}
                        </div>
                        <div className="text-sm text-slate-500">submissions</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}