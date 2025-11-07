export type Drop = {
    id: string;
    title: string;
    description: string | null;
    totalSlots: number;
    claimWindowStart: string;
    claimWindowEnd: string;
    isActive: boolean;
    waitlists: Array<{
        id: string;
    }>
};