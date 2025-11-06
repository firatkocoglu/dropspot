import {Router} from "express";
import {WaitlistController} from "@/controllers/waitlist.controller";
import {refreshSession} from "@/middlewares/refreshSession";
import {requireAuth} from "@/middlewares/requireAuth";

const router = Router();

// Sadece login gerektirenler — refreshSession önce!
router.post("/:id/join",  [refreshSession, requireAuth], WaitlistController.join);
router.post("/:id/leave", [refreshSession, requireAuth], WaitlistController.leave);

export const waitlistRouter = router;