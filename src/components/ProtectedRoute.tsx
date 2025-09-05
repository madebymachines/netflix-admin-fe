"use client";

import { useAuthStore } from "@/stores/auth/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Jika pengecekan awal selesai (`!isLoading`) dan pengguna tidak terautentikasi,
    // maka lakukan redirect.
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Selama pengecekan awal atau jika belum terautentikasi, tampilkan UI loading.
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <div className="space-y-4 p-8">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  // Jika semua baik, tampilkan children.
  return <>{children}</>;
}
