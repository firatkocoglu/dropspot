import {Router} from "express";
import {requireAuth} from "@/middlewares/requireAuth";
import {ClaimController} from "@/controllers/claim.controller";

const router = Router();

router.post("/:id/claim",  [requireAuth], ClaimController.claim);

export const claimRouter = router;