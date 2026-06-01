'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import TableSkeleton from '@/components/ui/TableSkeleton'
import toast from 'react-hot-toast'

type Parent = {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  phone: string | null
  students: Array<{
    id: string
    rollNumber: string
    user: {
      name: string
    }
    class: {
      name: string
      section: string
    } | null
  }>
}

type Student = {
  id: string
  rollNumber: string
  user: {
    name: string
  }
  class: {
    name: string
    section: string
  } | null
}

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingParent, setEditingParent] = useState<Parent | null>(null)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [linkingParent, setLinkingParent] = useState<Parent | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    studentIds: [] as string[]
  })

  useEffect(() => {
    fetchParents()
    fetchAllStudents()
  }, [])

  const fetchParents = async () => {
    try {
      const res = await fetch('/api/parents')
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setParents(data)
      } else {
        console.error('Parents API error:', data)
        setParents([])
      }
    } catch (error) {
      console.error('Error fetching parents:', error)
      setParents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAllStudents = async () => {
    try {
      const res = await fetch('/api/students')
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setAllStudents(data)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await fetch('/api/parents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setFormData({ name: '', email: '', password: '', phone: '', studentIds: [] })
        setShowForm(false)
        fetchParents()
        toast.success('Parent account created successfully! 👨‍👩‍👧')
      } else {
        setError(data.error || 'Failed to create parent')
      }
    } catch (error) {
      console.error('Error creating parent:', error)
      setError('Error creating parent')
    }
  }

  const handleEdit = (parent: Parent) => {
    setEditingParent(parent)
    setFormData({
      name: parent.user.name,
      email: parent.user.email,
      password: '',
      phone: parent.phone || '',
      studentIds: parent.students.map(s => s.id)
    })
    setShowForm(true)
  }

  const handleUpdate = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!editingParent) return

    try {
      const res = await fetch(`/api/parents/${editingParent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setFormData({ name: '', email: '', password: '', phone: '', studentIds: [] })
        setShowForm(false)
        setEditingParent(null)
        fetchParents()
        toast.success('Parent updated successfully!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update parent')
      }
    } catch (error) {
      console.error('Error updating parent:', error)
      toast.error('Error updating parent')
    }
  }

  const handleLinkStudents = async () => {
    if (!linkingParent || selectedStudents.length === 0) {
      toast.error('Please select at least one student')
      return
    }

    try {
      const res = await fetch(`/api/parents/${linkingParent.id}/link-students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudents })
      })

      if (res.ok) {
        toast.success('Students linked successfully!')
        setLinkingParent(null)
        setSelectedStudents([])
        fetchParents()
      } else {
        toast.error('Failed to link students')
      }
    } catch (error) {
      console.error('Error linking students:', error)
      toast.error('Error linking students')
    }
  }

  const filteredParents = parents.filter(parent =>
    parent.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    parent.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    parent.phone?.includes(searchQuery)
  )

  if (loading) {
    return (
      <DashboardLayout requiredRole="ADMIN">
        <div className="container mx-auto p-6">
          <TableSkeleton rows={5} columns={4} />
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
            <h1 className="text-3xl font-bold tracking-tight">Manage Parents</h1>
            <p className="text-base text-muted-foreground mt-1">Add and manage parent accounts</p>
          </div>
          <Button 
            onClick={() => {
              setShowForm(!showForm)
              setEditingParent(null)
              setFormData({ name: '', email: '', password: '', phone: '', studentIds: [] })
            }} 
            size="lg" 
            className="text-base"
          >
            {showForm ? '✕ Cancel' : '+ Add Parent'}
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <Input
              placeholder="Search by name, email, or phone..."
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
                {editingParent ? 'Edit Parent' : 'Create Parent Account'}
              </CardTitle>
              <CardDescription className="text-base">
                {editingParent ? 'Update parent information' : 'Fill in parent details and link children'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-base">
                  {error}
                </div>
              )}
              
              <form onSubmit={editingParent ? handleUpdate : handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">Full Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., John Smith"
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
                      placeholder="parent@example.com"
                      className="h-11 text-base"
                      disabled={!!editingParent}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base">
                      Password {editingParent && '(leave blank to keep current)'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required={!editingParent}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min. 6 characters"
                      minLength={6}
                      className="h-11 text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g., +1234567890"
                      className="h-11 text-base"
                    />
                  </div>
                </div>

                {/* Student Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Link Children (Optional)</Label>
                  <p className="text-sm text-muted-foreground">Select the students who are children of this parent</p>
                  <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                    {allStudents.length === 0 ? (
                      <p className="text-base text-center py-4 text-muted-foreground">
                        No students available. Please add students first.
                      </p>
                    ) : (
                      allStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg"
                        >
                          <Checkbox
                            checked={formData.studentIds.includes(student.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  studentIds: [...formData.studentIds, student.id]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  studentIds: formData.studentIds.filter(id => id !== student.id)
                                })
                              }
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-base">{student.user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Roll: {student.rollNumber}
                              {student.class && ` • ${student.class.name} ${student.class.section}`}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {formData.studentIds.length > 0 && (
                    <p className="text-sm text-blue-600">
                      {formData.studentIds.length} student(s) selected
                    </p>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button type="submit" size="lg" className="text-base">
                    {editingParent ? 'Update Parent' : 'Create Parent Account'}
                  </Button>
                  {editingParent && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg" 
                      onClick={() => {
                        setEditingParent(null)
                        setShowForm(false)
                        setFormData({ name: '', email: '', password: '', phone: '', studentIds: [] })
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

        {/* Parents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">All Parents ({filteredParents.length})</CardTitle>
            <CardDescription className="text-base">Manage parent accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Name</TableHead>
                  <TableHead className="text-base">Email</TableHead>
                  <TableHead className="text-base">Phone</TableHead>
                  <TableHead className="text-base">Linked Children</TableHead>
                  <TableHead className="text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-lg text-muted-foreground">
                        {searchQuery ? 'No parents found matching your search' : 'No parents yet. Create your first parent account!'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell className="font-medium text-base">{parent.user.name}</TableCell>
                      <TableCell className="text-base">{parent.user.email}</TableCell>
                      <TableCell className="text-base">{parent.phone || 'Not provided'}</TableCell>
                      <TableCell className="text-base">
                        {parent.students.length === 0 ? (
                          <Badge variant="secondary" className="text-sm">No children linked</Badge>
                        ) : (
                          <div className="space-y-1">
                            {parent.students.map((student) => (
                              <div key={student.id} className="text-sm">
                                <span className="font-medium">{student.user.name}</span>
                                {student.class && (
                                  <span className="text-muted-foreground ml-2">
                                    ({student.class.name} {student.class.section})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(parent)}
                            className="text-sm"
                          >
                            Edit
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-sm"
                                onClick={() => {
                                  setLinkingParent(parent)
                                  setSelectedStudents(parent.students.map(s => s.id))
                                }}
                              >
                                Link Students
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-2xl">Link Students to {parent.user.name}</DialogTitle>
                                <DialogDescription className="text-base">
                                  Select students to link to this parent account
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                {allStudents.length === 0 ? (
                                  <p className="text-base text-center py-8 text-muted-foreground">
                                    No students available. Please add students first.
                                  </p>
                                ) : (
                                  <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {allStudents.map((student) => (
                                      <div
                                        key={student.id}
                                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50"
                                      >
                                        <Checkbox
                                          checked={selectedStudents.includes(student.id)}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setSelectedStudents([...selectedStudents, student.id])
                                            } else {
                                              setSelectedStudents(selectedStudents.filter(id => id !== student.id))
                                            }
                                          }}
                                        />
                                        <div className="flex-1">
                                          <p className="font-medium text-base">{student.user.name}</p>
                                          <p className="text-sm text-muted-foreground">
                                            Roll: {student.rollNumber}
                                            {student.class && ` • ${student.class.name} ${student.class.section}`}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <Button 
                                  onClick={handleLinkStudents} 
                                  className="w-full text-base"
                                  size="lg"
                                  disabled={selectedStudents.length === 0}
                                >
                                  Link {selectedStudents.length} Student(s)
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
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