import { NextRequest, NextResponse } from "next/server";

export function authMiddleware(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;

  const isLoginPage = pathname.startsWith("/auth/login");
  const isDashboardPage = pathname.startsWith("/dashboard");

  // Jika mencoba mengakses halaman dashboard tanpa token, redirect ke halaman login.
  if (isDashboardPage && !accessToken) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Jika mencoba mengakses halaman login saat sudah memiliki token, redirect ke dashboard.
  if (isLoginPage && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Jika tidak ada kondisi di atas yang terpenuhi, jangan lakukan apa-apa (lanjutkan ke request berikutnya).
  return null;
}
