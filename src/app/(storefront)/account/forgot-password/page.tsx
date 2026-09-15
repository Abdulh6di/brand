"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const email = new FormData(e.currentTarget).get("email");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-editorial max-w-md py-16 md:py-24">
      <div className="mb-10 text-center">
        <p className="kicker mb-3">Account Recovery</p>
        <h1 className="font-display text-4xl">Forgot Password</h1>
      </div>
      {sent ? (
        <p className="text-center text-sm text-charcoal/75">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
          </Button>
        </form>
      )}
    </div>
  );
}
