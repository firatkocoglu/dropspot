import {Request, Response} from "express";
import {ClaimService} from "@/services/claim.service";

export const ClaimController = {
    async claim(req: Request, res: Response) {
        const dropId = req.params.id;
        const userId = (req as any).user.id;

        const result = await ClaimService.claim(dropId, userId);
        return res.status(200).json(result);
    },
};