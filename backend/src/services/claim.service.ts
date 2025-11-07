import { PrismaClient } from "@prisma/client";
import { throwError } from "@/utils/errors";
import { generateClaimCode } from "@/utils/code";
import { Prisma } from "@/generated/prisma";
import sql = Prisma.sql;

const prisma = new PrismaClient();
export const ClaimService = {
    async claim(dropId: string, userId: string) {
        return prisma.$transaction(async (tx) => {
            // Lock the drop record to ensure atomicity and prevent race conditions
            await tx.$queryRaw(sql`SELECT id
                                   FROM "Drop"
                                   WHERE id = ${ dropId } FOR UPDATE`);

            // Ensure the drop is active and the claim window is open
            const drop = await tx.drop.findUnique({
                where: { id: dropId }
            });
            const now = new Date();
            if ( !drop?.isActive ) throwError(409, 'DROP_NOT_ACTIVE', 'Drop is not active');
            if ( now < drop.claimWindowStart || now > drop.claimWindowEnd ) throwError(409, 'CLAIM_WINDOW_CLOSED', 'Claim window is closed');

            // Ensure the user is in the waitlist
            const entry = await tx.waitlist.findUnique({
                where: { userId_dropId: { userId, dropId } },
                select: { userId: true, joinedAt: true, priorityScore: true }
            });
            if ( !entry ) throwError(409, 'NOT_IN_WAITLIST', 'User is not in the waitlist');

            //  Ensure the user is eligible by priority score
            // Enforce priority: user must be within top N (N = totalSlots)
            const higherCount = await tx.waitlist.count({
                where: {
                    dropId,
                    OR: [
                        { priorityScore: { gt: entry.priorityScore } },
                        {
                            AND: [
                                { priorityScore: entry.priorityScore },
                                { joinedAt: { lt: entry.joinedAt } }
                            ]
                        }
                    ]
                }
            });
            const rank = higherCount + 1;
            if ( rank > drop.totalSlots ) {
                throwError(409, 'NOT_ELIGIBLE_BY_PRIORITY', 'User is not within the top priority for this drop');
            }

            // Ensure the capacity is not exceeded
            const usedCount = await tx.claim.count({ where: { dropId, status: 'USED' } });
            const remaining = drop.totalSlots - usedCount;
            if ( remaining <= 0 ) throwError(409, 'SOLD_OUT', 'Capacity exceeded');


            const code = generateClaimCode();
            const claim = await tx.claim.upsert({
                where: { userId_dropId: { userId, dropId } },
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

            return { code: claim.code, usedAt: now };
        });
    },
};