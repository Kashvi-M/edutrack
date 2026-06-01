'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import TableSkeleton from '@/components/ui/TableSkeleton'
import toast from 'react-hot-toast'

type Student = {
  id: string
  rollNumber: string
  user: {
    id: string
    name: string
    email: string
  }
  class: {
    id: string
    name: string
    section: string
  } | null
  parent: {
    user: {
      name: string
    }
  } | null
}

type Class = {
  id: string
  name: string
  section: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    classId: ''
  })

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students')
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setStudents(data)
      } else {
        console.error('Students API error:', data)
        setStudents([])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setClasses(data)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setFormData({ name: '', email: '', password: '', rollNumber: '', classId: '' })
        setShowForm(false)
        fetchStudents()
        toast.success('Student created successfully! 🎓')
      } else {
        setError(data.error || 'Failed to create student')
      }
    } catch (error) {
      console.error('Error creating student:', error)
      setError('Error creating student')
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      name: student.user.name,
      email: student.user.email,
      password: '', // Don't pre-fill password
      rollNumber: student.rollNumber,
      classId: student.class?.id || ''
    })
    setShowForm(true)
  }

  const handleUpdate = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!editingStudent) return

    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setFormData({ name: '', email: '', password: '', rollNumber: '', classId: '' })
        setShowForm(false)
        setEditingStudent(null)
        fetchStudents()
        toast.success('Student updated successfully!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update student')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      toast.error('Error updating student')
    }
  }

  const filteredStudents = students.filter(student =>
    student.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout requiredRole="ADMIN">
        <div className="container mx-auto p-6">
          <TableSkeleton rows={5} columns={5} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
            <p className="text-base text-muted-foreground mt-1">Add and manage student accounts</p>
          </div>
          <Button 
            onClick={() => {
              setShowForm(!showForm)
              setEditingStudent(null)
              setFormData({ name: '', email: '', password: '', rollNumber: '', classId: '' })
            }} 
            size="lg" 
            className="text-base"
          >
            {showForm ? '✕ Cancel' : '+ Add Student'}
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <Input
              placeholder="Search by name, email, roll number, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 text-base"
            />
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </CardTitle>
              <CardDescription className="text-base">
                {editingStudent ? 'Update student information' : 'Fill in student details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-base">
                  {error}
                </div>
              )}
              
              <form onSubmit={editingStudent ? handleUpdate : handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">Full Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Jane Doe"
                      className="h-11 text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@school.com"
                      className="h-11 text-base"
                      disabled={!!editingStudent}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base">
                      Password {editingStudent && '(leave blank to keep current)'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required={!editingStudent}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min. 6 characters"
                      minLength={6}
                      className="h-11 text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber" className="text-base">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      required
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      placeholder="e.g., 2024001"
                      className="h-11 text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="class" className="text-base">Class</Label>
                    <Select
                      value={formData.classId}
                      onValueChange={(value) => setFormData({ ...formData, classId: value })}
                    >
                      <SelectTrigger className="h-11 text-base">
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id} className="text-base">
                            {cls.name} - {cls.section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button type="submit" size="lg" className="text-base">
                    {editingStudent ? 'Update Student' : 'Create Student'}
                  </Button>
                  {editingStudent && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg" 
                      onClick={() => {
                        setEditingStudent(null)
                        setShowForm(false)
                        setFormData({ name: '', email: '', password: '', rollNumber: '', classId: '' })
                      }}
                      className="text-base"
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">All Students ({filteredStudents.length})</CardTitle>
            <CardDescription className="text-base">Manage student records</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Roll Number</TableHead>
                  <TableHead className="text-base">Name</TableHead>
                  <TableHead className="text-base">Email</TableHead>
                  <TableHead className="text-base">Class</TableHead>
                  <TableHead className="text-base">Parent</TableHead>
                  <TableHead className="text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-lg text-muted-foreground">
                        {searchQuery ? 'No students found matching your search' : 'No students yet. Create your first student!'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium text-base">{student.rollNumber}</TableCell>
                      <TableCell className="text-base">{student.user.name}</TableCell>
                      <TableCell className="text-base">{student.user.email}</TableCell>
                      <TableCell className="text-base">
                        {student.class ? (
                          <Badge variant="secondary" className="text-sm">
                            {student.class.name} - {student.class.section}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-base">
                        {student.parent ? (
                          <span className="text-sm">{student.parent.user.name}</span>
                        ) : (
                          <Badge variant="outline" className="text-sm">No parent linked</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(student)}
                          className="text-sm"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}