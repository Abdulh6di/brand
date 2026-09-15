"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProfileForm({ initialName, initialPhone, email }: { initialName: string; initialPhone: string; email: string }) {
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);

  async function onSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingProfile(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.get("name"), phone: formData.get("phone") }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingPassword(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.get("currentPassword"),
          newPassword: formData.get("newPassword"),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Password updated");
      e.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update password");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-14">
      <form onSubmit={onSaveProfile} className="space-y-5">
        <p className="kicker">Personal Information</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" defaultValue={initialName} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={initialPhone} />
          </div>
        </div>
        <Button type="submit" disabled={savingProfile}>
          {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
        </Button>
      </form>

      <form onSubmit={onChangePassword} className="space-y-5 border-t border-line pt-10">
        <p className="kicker">Change Password</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" name="newPassword" type="password" minLength={8} required />
          </div>
        </div>
        <Button type="submit" variant="outline" disabled={savingPassword}>
          {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
