"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAdmin() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("userData");

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    const parsed = JSON.parse(user);

    if (parsed.role !== "admin") {
      alert("Akses ditolak. Admin only.");
      router.replace("/dashboard");
    }
  }, []);
}
