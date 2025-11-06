import {PROJECT_SEED} from "@/config/seed";

/**
 * Derives three deterministic coefficients (A, B, C) from a given project seed.
 *  * How it works:
 *  * - Takes the first 6 hexadecimal characters of the SHA256 seed.
 *  * - Converts them to integers and applies modular arithmetic
 *  *   to produce small bounded variations in each coefficient.
 *  * - Example output range:
 *  *   A → 7–11, B → 13–19, C → 3–5
 */

export function generateCoefficientsFromSeed (seed: string) {
    const A = 7 + (parseInt(seed.substring(0, 2), 16) % 5) // coefficient of account age
    const B = 13 + (parseInt(seed.substring(2, 4), 16) % 7) // coefficient of join order to waitlist
    const C = 3 + (parseInt(seed.substring(4, 6), 16) % 3) // penalty coefficient for joining many waitlists (number of waitlists the user joined)

    return {A, B, C}
}

export const COEFFICIENTS = generateCoefficientsFromSeed(PROJECT_SEED)
