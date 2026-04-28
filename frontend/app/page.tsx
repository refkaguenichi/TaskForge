"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel soft-border rounded-[2rem] px-6 py-5 text-sm text-[var(--muted)]">
        Opening TaskForge...
      </div>
    </main>
  );
}
