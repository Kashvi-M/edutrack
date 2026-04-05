'use client'

type AttendanceDay = {
  date: string
  status: 'PRESENT' | 'ABSENT'
}

type Props = {
  data: AttendanceDay[]
}

export default function AttendanceCalendar({ data }: Props) {
  // Get last 30 days
  const getLast30Days = () => {
    const days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toISOString().split('T')[0])
    }
    return days
  }

  const last30Days = getLast30Days()

  const getStatusForDate = (dateStr: string) => {
    const record = data.find(d => d.date.split('T')[0] === dateStr)
    return record?.status || null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Last 30 Days</h3>
      <div className="grid grid-cols-10 gap-2">
        {last30Days.map((dateStr) => {
          const status = getStatusForDate(dateStr)
          const date = new Date(dateStr)
          const dayNum = date.getDate()
          
          return (
            <div
              key={dateStr}
              className={`aspect-square flex items-center justify-center rounded text-xs font-medium ${
                status === 'PRESENT'
                  ? 'bg-green-500 text-white'
                  : status === 'ABSENT'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
              title={`${dateStr} - ${status || 'No record'}`}
            >
              {dayNum}
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-gray-600">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-gray-600">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
          <span className="text-gray-600">No record</span>
        </div>
      </div>
    </div>
  )
}