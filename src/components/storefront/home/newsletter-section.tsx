"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";

export function NewsletterSection() {
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          name: formData.get("name"),
          consent: true,
        }),
      });
      if (!res.ok) throw new Error();
      trackEvent("newsletter_signup");
      toast.success("Welcome to the atelier list.");
      form.reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <section className="border-t border-line bg-warm-white py-20 md:py-28">
      <div className="container-editorial mx-auto max-w-xl text-center">
        <p className="kicker mb-4">Newsletter</p>
        <h2 className="font-display text-4xl">Be the first to discover what&apos;s next</h2>
        <p className="mx-auto mt-4 max-w-sm text-sm text-charcoal/75">
          New collections, atelier stories, and private previews — delivered
          occasionally, never more.
        </p>
        <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <Input name="name" placeholder="Name" required />
          <Input type="email" name="email" placeholder="Email address" required />
          <Button type="submit" disabled={status === "loading"} className="shrink-0">
            Subscribe
          </Button>
        </form>
        <p className="mt-4 text-[11px] text-taupe">
          By subscribing you agree to receive marketing emails and accept our{" "}
          <a href="/privacy-policy" className="underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </section>
  );
}
