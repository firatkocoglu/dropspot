/// <reference types="vitest" />
vi.mock("@/lib/apiClient");

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withQuery } from "@/test/setupTests";
import ClaimPage from "../page";
import { api } from "@/lib/apiClient";

describe("ClaimPage — idempotent behavior", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem("accessToken", "fake.jwt.token");
    });

    test("pressing Claim multiple times yields the same code", async () => {
        const now = Date.now();

        (api.get as any).mockResolvedValueOnce({
            data: {
                id: "drop-1",
                title: "Test Drop",
                description: "desc",
                totalSlots: 10,
                claimWindowStart: new Date(now - 60_000).toISOString(),
                claimWindowEnd: new Date(now + 300_000).toISOString(),
                isActive: true,
                waitlists: [{ id: "wl-1", userId: "u1", dropId: "drop-1", joinedAt: new Date(now - 120_000).toISOString() }],
            },
        });

        const SAME_CODE = "CLAIM-AB12CD34";
        (api.post as any).mockResolvedValue({ data: { code: SAME_CODE } });

        render(withQuery(<ClaimPage />));

        const claimBtn = await screen.findByRole("button", { name: /claim/i });

        await userEvent.click(claimBtn);
        await userEvent.click(claimBtn);
        await userEvent.click(claimBtn);

        const codeNode = await screen.findByText(SAME_CODE);
        expect(codeNode).toBeInTheDocument();

        const allCodes = screen.getAllByText(SAME_CODE);
        expect(allCodes.length).toBeGreaterThanOrEqual(1);
    });
});

describe("ClaimPage — status text", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem("accessToken", "fake.jwt.token");
    });

    test("shows 'Ends in:' when the claim window is open", async () => {
        const now = Date.now();
        (api.get as any).mockResolvedValueOnce({
            data: {
                id: "drop-1",
                title: "Open Drop",
                description: "desc",
                totalSlots: 10,
                claimWindowStart: new Date(now - 60_000).toISOString(),
                claimWindowEnd: new Date(now + 300_000).toISOString(),
                isActive: true,
                waitlists: [{ id: "wl-1", userId: "u1", dropId: "drop-1" }],
            },
        });

        render(withQuery(<ClaimPage />));
        expect(await screen.findByText(/Ends in:/i)).toBeInTheDocument();
    });

    test("shows 'Starts in:' when the claim window has NOT started yet", async () => {
        const now = Date.now();
        (api.get as any).mockResolvedValueOnce({
            data: {
                id: "drop-2",
                title: "Future Drop",
                description: "desc",
                totalSlots: 10,
                claimWindowStart: new Date(now + 300_000).toISOString(),
                claimWindowEnd: new Date(now + 600_000).toISOString(),
                isActive: true,
                waitlists: [], // user not joined (irrelevant)
            },
        });

        render(withQuery(<ClaimPage />));
        expect(await screen.findByText(/Starts in:/i)).toBeInTheDocument();
    });
});
