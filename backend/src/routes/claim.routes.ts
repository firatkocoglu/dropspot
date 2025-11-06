import {Router} from "express";
import {refreshSession} from "@/middlewares/refreshSession";
import {requireAuth} from "@/middlewares/requireAuth";
import {ClaimController} from "@/controllers/claim.controller";

const router = Router();

router.post("/:id/claim",  [refreshSession, requireAuth], ClaimController.claim);

export const claimRouter = router;