"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const plusDays = (n: number) =>
  new Date(Date.now() + n * 86400000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

type DoctorOption = { id: string; name: string; hospitalName: string };

export function AppointmentForm({
  doctorId,
  doctors = [],
}: {
  doctorId?: string;
  doctors?: DoctorOption[];
}) {
  const router = useRouter();
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorId ?? "");
  const activeDoctorId = doctorId ?? selectedDoctorId;
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState<string | null>(null);

  async function loadSlots(forDate: string) {
    setLoadingSlots(true);
    setSelected(null);
    setError(null);
    const res = await fetch(`/api/doctors/${activeDoctorId}/slots?date=${forDate}`);
    const data = await res.json().catch(() => ({}));
    setSlots(res.ok ? data.slots : []);
    setLoadingSlots(false);
  }

  useEffect(() => {
    if (!activeDoctorId) return;
    const timer = window.setTimeout(() => loadSlots(date), 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, activeDoctorId]);

  async function book() {
    if (!selected) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/auth/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId: activeDoctorId, slotStart: selected, reason: reason || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (res.ok) {
      setBooked(selected);
      router.refresh();
      return;
    }
    setError(data.error ?? "Something went wrong. Try again.");
    if (res.status === 409) loadSlots(date); // refresh so the taken slot disappears
  }

  if (booked) {
    return (
      <div className="rounded-lg border p-4">
        <p className="font-medium">Appointment booked</p>
        <p className="text-sm text-muted-foreground">
          {new Date(booked).toLocaleDateString("en-IN", { dateStyle: "full", timeZone: "Asia/Kolkata" })} at{" "}
          {formatTime(booked)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {doctors.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="doctor">Choose a doctor</Label>
          <select
            id="doctor"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={selectedDoctorId}
            onChange={(event) => {
              setSelectedDoctorId(event.target.value);
              setSlots([]);
              setSelected(null);
            }}
          >
            <option value="">Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} · {doctor.hospitalName}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="date">Choose a date</Label>
        <Input id="date" type="date" value={date} min={today()} max={plusDays(30)}
          onChange={(e) => e.target.value && setDate(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Available times</Label>
        {loadingSlots ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No free slots on this date. Try another day.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => (
              <Button key={s} type="button" size="sm"
                variant={selected === s ? "default" : "outline"}
                onClick={() => setSelected(s)}>
                {formatTime(s)}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for visit (optional)</Label>
        <Input id="reason" maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button className="w-full" disabled={!selected || submitting} onClick={book}>
        {submitting ? "Booking..." : "Confirm appointment"}
      </Button>
    </div>
  );
}