'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type SubjectData = {
  subject: string
  submitted: number
  graded: number
  avgScore: number
}

type Props = {
  data: SubjectData[]
}

export default function ClassPerformanceChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No data available yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subject" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="submitted" fill="#3B82F6" name="Submitted" />
          <Bar dataKey="graded" fill="#10B981" name="Graded" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}