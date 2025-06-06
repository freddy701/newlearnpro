import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware";

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;

  // Paths that are always accessible
  const publicPaths = ["/", "/auth/login", "/auth/register", "/auth/error"];
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname);

  // Check if the path is for the API
  const isApiPath = req.nextUrl.pathname.startsWith("/api");

  // Path specifically for teachers
  const isTeacherPath = req.nextUrl.pathname.startsWith("/teacher");

  // Path for admin dashboard
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");

  // Path for contact form (accessible to authenticated users)
  const isContactPath = req.nextUrl.pathname === "/contact/become-teacher";

  // Redirect to login if trying to access protected routes while not authenticated
  if (!isAuthenticated && !isPublicPath && !isApiPath) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Protect teacher routes - only teachers and admins can access
  if (isTeacherPath && isAuthenticated) {
    if (token.role !== "TEACHER" && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Protect admin routes - only admins can access
  if (isAdminPath && isAuthenticated) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Redirect users to their appropriate dashboard based on role
  if (isAuthenticated && req.nextUrl.pathname === "/dashboard") {
    if (token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    } else if (token.role === "TEACHER") {
      return NextResponse.redirect(new URL("/teacher/dashboard", req.url));
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for static files, api routes that aren't auth-related, and _next
    "/((?!_next/static|_next/image|favicon.ico|images|api/(?!auth)).*)",
  ],
};
