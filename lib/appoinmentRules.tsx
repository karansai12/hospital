export const CHANGE_CUTOFF_MS = 2 * 60 * 60 * 1000; // 2 hours

export function canChange(slotStart: Date, status: string) {
  return status === "BOOKED" && slotStart.getTime() - Date.now() > CHANGE_CUTOFF_MS;
}