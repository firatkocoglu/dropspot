-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('ISSUED', 'USED', 'EXPIRED');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ;

-- CreateTable
CREATE TABLE "Drop" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "claimWindowStart" TIMESTAMPTZ NOT NULL,
    "claimWindowEnd" TIMESTAMPTZ NOT NULL,
    "totalSlots" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Drop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "priorityScore" INTEGER NOT NULL,
    "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'ISSUED',
    "issuedAt" TIMESTAMPTZ NOT NULL,
    "usedAt" TIMESTAMPTZ,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Drop_isActive_idx" ON "Drop"("isActive");

-- CreateIndex
CREATE INDEX "Drop_claimWindowStart_claimWindowEnd_idx" ON "Drop"("claimWindowStart", "claimWindowEnd");

-- CreateIndex
CREATE INDEX "Drop_createdAt_idx" ON "Drop"("createdAt");

-- CreateIndex
CREATE INDEX "Waitlist_userId_idx" ON "Waitlist"("userId");

-- CreateIndex
CREATE INDEX "Waitlist_joinedAt_idx" ON "Waitlist"("joinedAt");

-- CreateIndex
CREATE INDEX "Waitlist_dropId_priorityScore_joinedAt_idx" ON "Waitlist"("dropId", "priorityScore" DESC, "joinedAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_userId_dropId_key" ON "Waitlist"("userId", "dropId");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_code_key" ON "Claim"("code");

-- CreateIndex
CREATE INDEX "Claim_userId_idx" ON "Claim"("userId");

-- CreateIndex
CREATE INDEX "Claim_dropId_idx" ON "Claim"("dropId");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE INDEX "Claim_issuedAt_idx" ON "Claim"("issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_userId_dropId_key" ON "Claim"("userId", "dropId");

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "Drop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "Drop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
