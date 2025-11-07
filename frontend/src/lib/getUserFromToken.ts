import { jwtDecode } from "jwt-decode";

export type AccessTokenPayload = {
    sub: string;
    role?: "ADMIN" | "USER";
    email?: string;
    exp: number;
    iat: number;
    jti?: string;
};

export function getUserFromToken(): AccessTokenPayload | null {
    const stored = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!stored) return null;
    try {
        return jwtDecode<AccessTokenPayload>(stored);
    } catch {
        return null;
    }
}