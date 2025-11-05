import {Router} from "express";
import {DropController} from "@/controllers/drop.controller";
import {requireAuth} from "@/middlewares/requireAuth";
import {requireAdmin} from "@/middlewares/requireAdmin";

const router = Router();

router.get('/', DropController.listActive);
router.post('/', [requireAuth, requireAdmin], DropController.create);
router.patch('/:id', [requireAuth, requireAdmin], DropController.update);
router.delete('/:id', [requireAuth, requireAdmin], DropController.delete);

export const dropRouter = router;