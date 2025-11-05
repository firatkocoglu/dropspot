import {DropService} from "@/services/drop.service";

export const DropController = {
    async listActive(req: any, res: any) {
        const result = await DropService.listActive();
        return res.status(200).json(result);
    },

    async create(req: any, res: any) {
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

    async update(req: any, res: any) {
        const { id } = req.params;
        console.log(id);
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

    async delete(req: any, res: any) {
        const { id } = req.params;
        const deleted = await DropService.deleteDrop(id);
        return res.status(204).end();
    }
}