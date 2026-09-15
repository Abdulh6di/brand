"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminButton } from "@/components/admin/ui";

export function ArchiveButton({
  endpoint,
  redirectTo = "/admin/products",
  label = "Archive",
  confirmText = "Archive this item?",
}: {
  endpoint: string;
  redirectTo?: string;
  label?: string;
  confirmText?: string;
}) {
  const router = useRouter();

  async function onClick() {
    if (!confirm(confirmText)) return;
    const res = await fetch(endpoint, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "Unable to complete action");
      return;
    }
    toast.success("Done");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <AdminButton type="button" variant="danger" onClick={onClick}>
      {label}
    </AdminButton>
  );
}
