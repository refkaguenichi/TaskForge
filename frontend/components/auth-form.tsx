"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        await api.register({ email, password, name });
      } else {
        await api.login({ email, password });
      }

      router.push("/workspace");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to continue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)]">
      <section className="mx-auto flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="glass-panel soft-border w-full max-w-md rounded-[2rem] p-6 sm:p-8">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              {isRegister ? "Create account" : "Welcome back"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
              {isRegister ? "Start planning smarter." : "Pick up where you left off."}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {isRegister
                ? "Register to open your TaskForge workspace and start new conversations."
                : "Sign in to continue your planning conversations and review generated tasks."}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister ? (
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Name</span>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ada Lovelace"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Email</span>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Password</span>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Strong password"
                required
              />
            </label>

            {isRegister ? (
              <p className="rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-xs leading-6 text-[var(--accent-strong)]">
                Password must be at least 8 characters and include uppercase,
                lowercase, a number, and one special character.
              </p>
            ) : null}

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create workspace access"
                  : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            {isRegister ? "Already have an account?" : "Need an account?"}{" "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-semibold text-[var(--accent-strong)]"
            >
              {isRegister ? "Sign in" : "Create one"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
