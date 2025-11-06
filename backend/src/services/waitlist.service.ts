import {PrismaClient} from "@prisma/client";
import {COEFFICIENTS} from "@/utils/seed";
import {throwError} from "@/utils/errors";

const prisma = new PrismaClient();

export const WaitlistService = {
    async join(userId: string, dropId: string,) {
        // Start a transaction to ensure atomicity
        return prisma.$transaction(async (tx) => {
            const {A, B, C} = COEFFICIENTS;

            // Ensure the user exists
            const user = await tx.user.findUnique({
                where: {id: userId}
            });
            if (!user) throwError(404, 'USER_NOT_FOUND', 'User not found');


            // Ensure the drop exists
            const drop = await tx.drop.findUnique({
                where: {id: dropId}
            });
            if (!drop) throwError(404, 'DROP_NOT_FOUND', 'Drop not found');

            // Check if the claim window for the drop has started and the waitlist is closed
            const now = new Date()
            if (drop.claimWindowStart && new Date(drop.claimWindowStart).getTime() <= now.getTime()) {
                throwError(400, 'WAITLIST_CLOSED_CLAIM_OPEN', 'Claim window has started; waitlist is closed');
            }

            // Calculate user order in waitlist
            const existingCountForDrop = await tx.waitlist.count({
                where: {dropId}
            })
            const userOrder = existingCountForDrop + 1;

            // Calculate account age (in days)
            const createdAt = new Date(user.createdAt);
            const diffMs = now.getTime() - createdAt.getTime();
            const accountAgeDays = Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 1);

            // Count number of waitlists the user has joined
            const userWaitlistCount = await tx.waitlist.count(
                {
                    where: { userId, NOT: {dropId} } // Exclude the current drop
                });

            // Calculate priority score
            const priorityScore: number = (userOrder % A) + (accountAgeDays % B) - (userWaitlistCount % C);

            /**
             * For idempotency concerns, I use upsert to ensure that the user is only added to the waitlist once.
             */
            return tx.waitlist.upsert({
                where: {userId_dropId: {userId, dropId}},
                create: {userId, dropId, joinedAt: now, priorityScore},
                update: {} // Do nothing if the user is already in the waitlist
            });
        });
    },

    async leave(userId: string, dropId: string) {
        await prisma.waitlist.deleteMany( {
                where: { userId, dropId }
            }
        )
    }
}