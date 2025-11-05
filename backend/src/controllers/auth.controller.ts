import {Request, Response} from "express";
import {AuthService} from "@/services/auth.service";

export const AuthController = {
    async signup(req: Request, res: Response) {
        const { email, password } = req.body;
        const result = await AuthService.signup(email, password);
        res.cookie('refresh-token', result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(201).json({
            user: result.user,
            accessToken: result.accessToken,
        });
    },

    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        res.cookie('refresh-token', result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({
            user: result.user,
            accessToken: result.accessToken,
        })
    },

    async refresh(req: Request, res: Response) {
        const refreshToken = req.cookies["refresh-token"];
        if (!refreshToken) {
            return res
                .status(401)
                .json({ error: 'MISSING_REFRESH_TOKEN', message: 'Refresh token cookie is missing' });
        }

        const result = await AuthService.refresh(refreshToken);
        res.cookie('refresh-token', result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({
            accessToken: result.accessToken,
        });
    },

    async logout(req: Request, res: Response) {
        const refreshToken = req.cookies?.["refresh-token"];
        const accessToken = req.headers.authorization?.split(" ")[1];
        if (refreshToken && accessToken) {
            await AuthService.logout(refreshToken, accessToken);
        }
        res.clearCookie('refresh-token', { path: '/auth' });
        return res.status(204).end();
    }
}