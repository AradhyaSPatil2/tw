import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if user is logged in by looking for the login cookie or localStorage flag
  // Since we can't access localStorage in middleware, we'll handle this client-side
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/customers/:path*", "/leads/:path*", "/tasks/:path*", "/reports/:path*"],
}
