import {Router} from "express";
import {AuthController} from "@/controllers/auth.controller";

const router = Router();

// Auth endpoints
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

export const authRouter = router;
