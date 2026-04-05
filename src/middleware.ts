import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // If no token, let withAuth handle redirect to login
    if (!token) {
      return NextResponse.next()
    }

    // Role-based access control - only block if accessing WRONG dashboard
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    
    if (path.startsWith('/teacher') && token?.role !== 'TEACHER') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    
    if (path.startsWith('/student') && token?.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    
    if (path.startsWith('/parent') && token?.role !== 'PARENT') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/parent/:path*',
  ]
}