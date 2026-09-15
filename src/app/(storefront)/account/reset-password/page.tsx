import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/storefront/account/reset-password-form";

export const metadata: Metadata = { title: "Reset Password" };

export default function ResetPasswordPage() {
  return (
    <div className="container-editorial max-w-md py-16 md:py-24">
      <div className="mb-10 text-center">
        <p className="kicker mb-3">Account Recovery</p>
        <h1 className="font-display text-4xl">Reset Password</h1>
      </div>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
