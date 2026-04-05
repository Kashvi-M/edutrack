'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type GradeData = {
  assignment: string
  grade: number
  maxMarks: number
  percentage: number
}

type Props = {
  data: GradeData[]
}

export default function GradeChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No graded assignments yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="assignment" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="font-semibold text-gray-900">{data.assignment}</p>
                    <p className="text-sm text-gray-600">
                      Score: {data.grade}/{data.maxMarks}
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      {data.percentage.toFixed(1)}%
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="percentage" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={{ fill: '#3B82F6', r: 5 }}
            activeDot={{ r: 7 }}
            name="Score %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}