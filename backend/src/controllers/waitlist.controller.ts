import {Request, Response} from "express";
import {WaitlistService} from "@/services/waitlist.service";

export const WaitlistController = {
    async join(req: Request, res: Response) {
        const dropId = req.params.id;
        const userId = (req as any).user.id
        const entry = await WaitlistService.join(userId, dropId);
        return res.status(200).json({
            dropId,
            userId,
            priorityScore: entry.priorityScore,
            joinedAt: entry.joinedAt,
        });
    },

    async leave(req: Request, res: Response) {
        const dropId = req.params.id;
        const userId = (req as any).user.id
        await WaitlistService.leave(userId, dropId);
        return res.sendStatus(204);
    },
};