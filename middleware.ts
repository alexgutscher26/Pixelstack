import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(
  async function middleware() {
    // Middleware logic is handled by Kinde's withAuth
    // This function runs for authenticated users on protected routes
  },
  {
    isReturnToCurrentPage: true,
    // Add public paths if needed, but the matcher handles most of it
    // publicPaths: ["/"],
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - auth (authentication routes)
     * - favicon.ico (favicon file)
     * - public images/assets (if any)
     */
    "/((?!api|_next/static|_next/image|auth|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
