import { PrismaClient } from "@prisma/client";
import { throwError } from "@/utils/errors";

const prisma = new PrismaClient();

export const DropService = {
    async listActive(userId: string) {
        const drops = await prisma.drop.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                title: true,
                isActive: true,
                totalSlots: true,
                description: true,
                claimWindowStart: true,
                claimWindowEnd: true,
                createdAt: true,
                waitlists: {
                    where: { userId },
                    select: { id: true }
                }
            }
        });

        return { drops, count: drops.length };
    },

    async retrieve(id: string, userId: string) {
        const drop = await prisma.drop.findUnique({
            where: { id, isActive: true },
            select: {
                id: true,
                title: true,
                isActive: true,
                totalSlots: true,
                description: true,
                claimWindowStart: true,
                claimWindowEnd: true,
                createdAt: true,
                waitlists: {
                    where: { userId },
                    select: { id: true }
                }
            }
        });

        if ( !drop ) {
            throwError(404, 'DROP_NOT_FOUND', 'Drop not found');
        }
        return drop;
    },

    async createDrop(title: string, description: string | null, totalSlots: number, claimWindowStart: Date, claimWindowEnd: Date, isActive: boolean = true) {
        if ( !title || totalSlots <= 0 || claimWindowStart >= claimWindowEnd ) {
            throwError(400, 'INVALID_DROP', 'Invalid drop data');
        }

        const dropData = {
            title,
            description,
            totalSlots,
            claimWindowStart,
            claimWindowEnd,
            isActive: true,
        };

        return prisma.drop.create({
            data: dropData,
        });
    },

    async updateDrop(id: string, patch: Partial<{
        title: string;
        description: string | null;
        totalSlots: number;
        claimWindowStart: Date;
        claimWindowEnd: Date;
        isActive: boolean;
    }>) {
        // Ensure patch is not empty
        if ( !patch || Object.keys(patch).length === 0 ) {
            throwError(400, 'INVALID_PATCH', 'No data provided for update');
        }

        // Ensure totalSlots is greater than 0
        if ( typeof patch.totalSlots === 'number' && patch.totalSlots <= 0 ) {
            throwError(400, 'INVALID_PATCH', 'totalSlots must be greater than 0');
        }

        // Fetch existing drop to be updated
        const drop = await prisma.drop.findUnique({
            where: { id }
        });

        if ( !drop ) {
            throwError(404, 'DROP_NOT_FOUND', 'Drop not found');
        }

        const newStart = patch.claimWindowStart ?? drop.claimWindowStart;
        const newEnd = patch.claimWindowEnd ?? drop.claimWindowEnd;

        // Updated claim window start can't be after end window
        if ( newStart >= newEnd ) {
            throwError(400, 'INVALID_PATCH', 'claimWindowStart must be before claimWindowEnd');
        }

        return prisma.drop.update({
            where: { id },
            data: patch,
        });
    },

    async deleteDrop(id: string) {
        const drop = await prisma.drop.findUnique({
            where: { id }
        });

        if ( !drop ) {
            throwError(404, 'DROP_NOT_FOUND', 'Drop not found');
        }

        return prisma.drop.delete({
            where: { id },
        });
    }
};

