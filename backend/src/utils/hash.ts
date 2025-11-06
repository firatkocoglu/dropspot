import bcrypt from 'bcryptjs';
// SHA256 for refresh token
import * as crypto from "node:crypto";

// Implement password hashing and verification using bcrypt
export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const sha256 = (sha: string) => crypto.createHash('sha256').update(sha).digest('hex');

export const generateRefreshToken = () => crypto.randomBytes(32).toString('base64url');