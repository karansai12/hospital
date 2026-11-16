"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ApprovalButtons({ doctorId }: { doctorId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    if (action === "reject" && !window.confirm("Reject this doctor request?")) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/doctors/${doctorId}/${action}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Something went wrong");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button size="sm" disabled={busy} onClick={() => act("approve")}>Approve</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => act("reject")}>Reject</Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}