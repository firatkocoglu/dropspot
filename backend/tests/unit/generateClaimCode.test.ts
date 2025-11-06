import {describe, expect, it} from "vitest";
import {generateClaimCode} from "@/utils/code";

const CODE_PREFIX = "CLAIM-";
const ALPHANUM = /^[A-Z0-9]+$/;

describe("generateClaimCode", () => {
    it("returns code with CLAIM- prefix and 8-char body", () => {
        const code = generateClaimCode();
        expect(code.startsWith(CODE_PREFIX)).toBe(true);
        const body = code.slice(CODE_PREFIX.length);
        expect(body.length).toBe(8);
        expect(ALPHANUM.test(body)).toBe(true);
    });

    it("produces low collision risk across 1000 samples", () => {
        const set = new Set<string>();
        for (let i = 0; i < 1000; i++) {
            const c = generateClaimCode();
            expect(set.has(c)).toBe(false);
            set.add(c);
        }
    });
});