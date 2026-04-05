import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <Link 
          href="/login"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Login
        </Link>
      </div>
    </div>
  )
}