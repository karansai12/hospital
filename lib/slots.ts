const SLOT_MINUTES = 30;
const WINDOWS = [
  [9 * 60, 13 * 60],
  [14 * 60, 17 * 60],
]; // minutes since midnight, India time

// "2026-10-28" in India time
export function istDateString(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export function isValidDateString(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(new Date(`${date}T00:00:00+05:30`).getTime());
}

export function generateSlots(date: string): Date[] {
  const slots: Date[] = [];
  for (const [start, end] of WINDOWS) {
    for (let m = start; m + SLOT_MINUTES <= end; m += SLOT_MINUTES) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      slots.push(new Date(`${date}T${hh}:${mm}:00+05:30`));
    }
  }
  return slots;
}

export function slotEnd(start: Date) {
  return new Date(start.getTime() + SLOT_MINUTES * 60 * 1000);
}