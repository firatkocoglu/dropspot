import {DropService} from "@/services/drop.service";
import {Request, Response} from "express";

export const DropController = {
    async listActive(req: Request, res: Response) {
        const result = await DropService.listActive();
        return res.status(200).json(result);
    },

    async retrieve(req: Request, res: Response) {
        const result = await DropService.retrieve(req.params.id);
        return res.status(200).json(result);
    },

    async create(req: Request, res: Response) {
        const {
            title,
            description = null,
            totalSlots,
            claimWindowStart,
            claimWindowEnd,
            isActive = true
        } = req.body;

        const drop = await DropService.createDrop(
            title,
            description,
            Number(totalSlots),
            new Date(claimWindowStart),
            new Date(claimWindowEnd),
            Boolean(isActive),
        );
        return res.status(201).json(drop);
    },

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const patch = req.body as Partial<{
            title: string;
            description: string | null;
            totalSlots: number;
            claimWindowStart: Date;
            claimWindowEnd: Date;
            isActive: boolean;
        }>

        const updated = await DropService.updateDrop(id, patch);
        return res.status(200).json(updated);
    },

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        await DropService.deleteDrop(id);
        return res.status(204).end();
    }
}