import {randomBytes} from 'crypto';

export function generateClaimCode(): string {
    const bytes = randomBytes(6); // 48-bit randomness
    const base36 = parseInt(bytes.toString('hex'), 16).toString(36).toUpperCase();
    const clean = base36.replace(/[^A-Z0-9]/g, '').slice(0, 8).padEnd(8, '0');
    return 'CLAIM-' + clean;
}