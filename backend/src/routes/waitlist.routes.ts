import {Router} from "express";
import {WaitlistController} from "@/controllers/waitlist.controller";
import {requireAuth} from "@/middlewares/requireAuth";

const router = Router();

// Sadece login gerektirenler — refreshSession önce!
router.post("/:id/join",  [requireAuth], WaitlistController.join);
router.post("/:id/leave", [requireAuth], WaitlistController.leave);

export const waitlistRouter = router;