import bcrypt from 'bcryptjs';

// Implement password hashing and verification using bcrypt
export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

// SHA256 for refresh token
import * as crypto from "node:crypto";
export const sha256 = (sha: string) => crypto.createHash('sha256').update(sha).digest('hex');