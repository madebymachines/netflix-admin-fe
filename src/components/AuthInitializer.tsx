"use client";

import { useAuthStore } from "@/stores/auth/authStore";
import { useEffect } from "react";

function AuthInitializer() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return null;
}

export default AuthInitializer;
