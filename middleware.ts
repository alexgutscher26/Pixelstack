import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(
  async function middleware() {
    // console.log("look at me", req.url);
  },
  {
    isReturnToCurrentPage: true,
  }
);

export const config = {
  matcher: [
    "/project/:path*",
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - auth (authentication routes)
    // - favicon.ico (favicon file)
    // "/((?!api|_next/static|_next/image|auth|favicon.ico).*)",
  ],
};
