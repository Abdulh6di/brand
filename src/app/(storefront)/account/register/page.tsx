import type { Metadata } from "next";
import { RegisterForm } from "@/components/storefront/account/register-form";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="container-editorial max-w-md py-16 md:py-24">
      <div className="mb-10 text-center">
        <p className="kicker mb-3">Join Us</p>
        <h1 className="font-display text-4xl">Create Account</h1>
      </div>
      <RegisterForm />
    </div>
  );
}
