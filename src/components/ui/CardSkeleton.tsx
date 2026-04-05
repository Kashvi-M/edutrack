export default function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
          <div className="h-8 bg-gray-100 rounded w-1/3 animate-pulse"></div>
        </div>
      ))}
    </div>
  )
}