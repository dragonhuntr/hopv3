"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = authClient.useSession();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;
  
  return <>{children}</>;
} 