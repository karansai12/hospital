CREATE UNIQUE INDEX "Appointment_active_slot_key"
ON "Appointment"("doctorId", "slotStart")
WHERE "status" <> 'CANCELLED';