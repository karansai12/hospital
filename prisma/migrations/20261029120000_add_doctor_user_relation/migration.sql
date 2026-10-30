ALTER TABLE "Doctor" ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");

ALTER TABLE "Doctor"
ADD CONSTRAINT "Doctor_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;