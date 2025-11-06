import {PrismaClient} from "@prisma/client";
import {throwError} from "@/utils/errors";
import {generateClaimCode} from "@/utils/code";
import {Prisma} from "@/generated/prisma";
import sql = Prisma.sql;

const prisma = new PrismaClient();
export const ClaimService = {
    async claim(dropId: string, userId: string) {
        return prisma.$transaction(async (tx) => {
            // Lock the drop record to ensure atomicity and prevent race conditions
            await tx.$queryRaw(sql`SELECT id
                                   FROM "Drop"
                                   WHERE id = ${dropId} FOR UPDATE`);

            // Ensure the drop is active and the claim window is open
            const drop = await tx.drop.findUnique({
                where: {id: dropId}
            })
            const now = new Date();
            if (!drop?.isActive) throwError(409, 'DROP_NOT_ACTIVE', 'Drop is not active')
            if (now < drop.claimWindowStart || now > drop.claimWindowEnd) throwError(409, 'CLAIM_WINDOW_CLOSED', 'Claim window is closed')

            // Ensure the user is in the waitlist
            const entry = await tx.waitlist.findUnique({
                where: {userId_dropId: {userId, dropId}},
                select: {userId: true, joinedAt: true, priorityScore: true}
            })
            if (!entry) throwError(409, 'NOT_IN_WAITLIST', 'User is not in the waitlist')

            // Ensure the capacity is not exceeded
            const usedCount = await tx.claim.count({where: {dropId, status: 'USED'}})
            const remaining = drop.totalSlots - usedCount;
            if (remaining <= 0) throwError(409, 'SOLD_OUT', 'Capacity exceeded')

            /**
             * Ensure the user is eligible to claim
             * Only the first 'remaining' users in the waitlist by priorityScore and joinedAt are eligible
             * Here remaining is the number of slots left
             **/
            const topN = await tx.waitlist.findMany({
                where: {dropId},
                orderBy: [{priorityScore: 'desc'}, {joinedAt: 'asc'}, {id: 'asc'}],
                take: remaining,
                select: {userId: true, priorityScore: true}
            })

            const eligible = topN.some(eligible => eligible.userId === userId);
            if (!eligible) throwError(409, 'NOT_ELIGIBLE', 'User is not eligible to claim')

            // Ensure user has not already claimed
            const existingClaim = await tx.claim.findUnique(
                {
                    where: {userId_dropId: {userId, dropId}},
                }
            )
            if (existingClaim?.status === 'USED') throwError(409, 'ALREADY_CLAIMED', 'User has already claimed')

            // Finalize the claim
            /**
             * Since we're asked to handle claim in just one endpoint
             * we'll just create a crypto-based cod and accept the code as valid
             * For idempotency concerns; I use upsert to ensure that the user can only claim once.
             * Attempting to claim again will just return the existing claim with status USED
             **/
            const code = generateClaimCode()
            await tx.claim.upsert({
                where: {userId_dropId: {userId, dropId}},
                create: {
                    userId, dropId, code,
                    status: 'USED',
                    issuedAt: now,
                    usedAt: now
                },
                update: {
                    status: 'USED',
                    usedAt: now,
                }
            });

            return {code, usedAt: now};
        });
    },
}