import { Router } from "express";
import { DropController } from "@/controllers/drop.controller";
import { requireAuth } from "@/middlewares/requireAuth";
import { requireAdmin } from "@/middlewares/requireAdmin";
import { refreshSession } from "@/middlewares/refreshSession";

const router = Router();

router.get('/', [refreshSession, requireAuth], DropController.listActive);
router.get('/:id', [refreshSession, requireAuth], DropController.retrieve);
router.post('/', [refreshSession, requireAuth, requireAdmin], DropController.create);
router.patch('/:id', [refreshSession, requireAuth, requireAdmin], DropController.update);
router.delete('/:id', [refreshSession, requireAuth, requireAdmin], DropController.delete);

export const dropRouter = router;