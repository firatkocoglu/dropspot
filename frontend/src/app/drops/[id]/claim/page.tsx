'use client';

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BadgeCheckIcon, Copy } from "lucide-react";
import { ClaimButton } from "@/components/ClaimButton";

type DropDetail = {
    id: string;
    title: string;
    description?: string;
    totalSlots: number;
    claimWindowStart: string;
    claimWindowEnd: string;
    isActive: boolean;
    userState?: { joined: boolean; claimStatus: 'NONE'|'ISSUED'|'USED'; code?: string; };
    actions?: { canJoin: boolean; canClaim: boolean; };
};

export default function ClaimPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const qc = useQueryClient();

    // ---- data fetch (hook always runs)
    const { data, isLoading, isError } = useQuery<DropDetail>({
        queryKey: ["drop", id],
        queryFn: async () => (await api.get(`/drops/${id}`)).data,
    });

    // ---- claim mutation (hook always runs)
    const [claimCode, setClaimCode] = useState<string | null>(null);
    const claim = useMutation({
        mutationFn: async () => (await api.post(`/drops/${id}/claim`)).data as { code: string },
        onSuccess: (res) => {
            setClaimCode(res.code);
            qc.invalidateQueries({ queryKey: ["drop", id] });
        },
    });

    useEffect(() => {
        claim.mutate();
    }, []);

    // ---- derive values (hooks always run, guard with ?.)
    const now = useMemo(() => new Date(), []);
    const start = useMemo(() => (data ? new Date(data.claimWindowStart) : null), [data]);
    const end   = useMemo(() => (data ? new Date(data.claimWindowEnd)   : null), [data]);

    const isClaimWindowOpen = !!(start && end && Date.now() >= start.getTime() && Date.now() <= end.getTime());
    const joined = data?.waitlists?.length > 0;
    const alreadyClaimed = data?.userState?.claimStatus === 'ISSUED' || data?.userState?.claimStatus === 'USED';
    const existingCode = data?.userState?.code ?? null;

    // ---- countdown (hook always runs)
    const target: Date | null = useMemo(() => {
        if (!start || !end) return null;
        const nowMs = Date.now();
        if (nowMs < start.getTime()) return start;  // starts in
        if (nowMs <= end.getTime()) return end;     // ends in
        return null;                                 // closed
    }, [start, end]);

    const [countdown, setCountdown] = useState("");
    useEffect(() => {
        if (!target) { setCountdown(""); return; }
        const tick = () => {
            const diff = target.getTime() - Date.now();
            if (diff <= 0) { setCountdown("00:00:00"); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            const pad = (n: number) => String(n).padStart(2, "0");
            setCountdown(`${pad(h)}:${pad(m)}:${pad(s)}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [target]);

    const codeToShow = claimCode ?? existingCode ?? null;

    const copyCode = async () => {
        if (!codeToShow) return;
        try { await navigator.clipboard.writeText(codeToShow); toast.success("Code copied"); }
        catch { toast.error("Copy failed"); }
    };

    // ---- render (conditional returns ONLY after all hooks)
    if (isLoading) {
        return <main className="min-h-[70vh] grid place-items-center">
            <div className="text-sm text-muted-foreground">Loading claim…</div>
        </main>;
    }
    if (isError || !data) {
        return <main className="min-h-[70vh] grid place-items-center">
            <div className="text-sm text-destructive">Failed to load drop.</div>
        </main>;
    }

    return (
        <main className="min-h-[80vh] w-full">
            <div className="mx-auto max-w-xl px-4 py-8 space-y-4">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2"
                            onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>

                </div>

                <Card className="border-muted-foreground/10 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">{data.title}</CardTitle>
                                {data.description && <CardDescription className="line-clamp-3">{data.description}</CardDescription>}
                            </div>
                            <div>
                                { data.isActive && (
                                    <Badge
                                        variant="secondary"
                                        className={ data.isActive ? "bg-green-600 text-white dark:bg-green-400 me-3" : "bg-red-500 text-white dark:bg-red-300 me-3"}
                                    >
                                        <BadgeCheckIcon/>
                                        { data.isActive ? "Active" : "Inactive" }
                                    </Badge>
                                ) }
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="rounded-xl bg-muted/40 p-4">
                            <div className="text-xs text-muted-foreground">Claim window</div>
                            <div className="text-sm">
                                {start?.toLocaleString()} → {end?.toLocaleString()}
                            </div>
                            <div className="mt-2 text-sm">
                                {!start || !end ? null :
                                    (Date.now() < start.getTime()
                                            ? <>Starts in: <span className="font-mono">{countdown}</span></>
                                            : (isClaimWindowOpen
                                                    ? <>Ends in: <span className="font-mono">{countdown}</span></>
                                                    : <span className="text-destructive">Window closed</span>
                                            )
                                    )}
                            </div>
                        </div>

                        {!joined && (
                            <div className="rounded-md border p-3 text-sm">
                                You are not in the waitlist. Join from the drop page to claim.
                            </div>
                        )}
                        {alreadyClaimed && (
                            <div className="rounded-md border p-3 text-sm">
                                You have already claimed this drop.
                            </div>
                        )}

                        {codeToShow && (
                            <div className="rounded-xl border p-4 flex items-center justify-between bg-green-50">
                                <div>
                                    <div className="text-xs text-muted-foreground">Your claim code</div>
                                    <div className="text-xl font-mono mt-1">{codeToShow}</div>
                                </div>
                                <Button variant="secondary" size="sm" onClick={copyCode}>
                                    <Copy className="h-4 w-4 mr-1" /> Copy
                                </Button>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col sm:flex-row sm:justify-end gap-3">
                        <ClaimButton dropId={ id } disabled={!isClaimWindowOpen || !joined }
                                     onClick={() => claim.mutate()}
                            />

                        <Button size="lg" variant="ghost" onClick={() => router.push(`/drops/${id}`)}>
                            Go to detail
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}