import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/storefront/account/login-form";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="container-editorial max-w-md py-16 md:py-24">
      <div className="mb-10 text-center">
        <p className="kicker mb-3">Welcome Back</p>
        <h1 className="font-display text-4xl">Sign In</h1>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
