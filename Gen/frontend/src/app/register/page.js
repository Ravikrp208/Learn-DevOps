"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified login page with the register tab selected
    router.replace("/login?tab=register");
  }, [router]);

  return (
    <div className="auth-page-wrapper" style={{ color: "var(--text-muted)" }}>
      Redirecting to register form...
    </div>
  );
}
