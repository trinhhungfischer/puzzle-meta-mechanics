import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith('/admin/login') || req.nextUrl.pathname.startsWith('/api/auth')
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  // Allow access to login and auth API routes
  if (isAuthRoute) {
    return
  }

  // Protect all other /admin routes
  if (isAdminRoute && !isLoggedIn) {
    const newUrl = new URL("/admin/login", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
