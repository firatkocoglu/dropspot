'use client';

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DropDetailPage() {
    const { id } = useParams<{ id: string }>();
    const qc = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["drop", id],
        queryFn: async () => (await api.get(`/drops/${ id }`)).data,
    });

    const join = useMutation({
        mutationFn: async () => api.post(`/drops/${ id }/join`),
        onSuccess: () => {
            toast.success("Joined waitlist");
            qc.invalidateQueries({ queryKey: ["drop", id] });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Join failed"),
    });

    const claim = useMutation({
        mutationFn: async () => (await api.post(`/drops/${ id }/claim`)).data,
        onSuccess: (res) => toast.success(`Your code: ${ res.code }`),
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Claim failed"),
    });

    if ( isLoading ) {
        return (
            <main className="min-h-[70vh] grid place-items-center">
                <div className="text-sm text-muted-foreground">Loading drop…</div>
            </main>
        );
    }
    if ( isError || !data ) {
        return (
            <main className="min-h-[70vh] grid place-items-center">
                <div className="text-sm text-destructive">Failed to load drop.</div>
            </main>
        );
    }
    
    const now = new Date();
    const start = new Date(data.claimWindowStart);
    const end = new Date(data.claimWindowEnd);
    const isClaimWindowOpen = now >= start && now <= end;

    const joinDisabled = join.isPending || isClaimWindowOpen;
    const claimDisabled = claim.isPending || !isClaimWindowOpen;

    return (
        <main className="min-h-[80vh] w-full">
            <div className="mx-auto max-w-3xl px-4 py-10">
                <Card className="border-muted-foreground/10 shadow-sm backdrop-blur">
                    <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-semibold tracking-tight">
                                { data.title }
                            </CardTitle>
                            <Badge variant={ data.isActive ? "default" : "secondary" }>
                                { data.isActive ? "Active" : "Inactive" }
                            </Badge>
                        </div>
                        <CardDescription className="text-sm">
                            { data.description }
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border p-4">
                                <div className="text-xs text-muted-foreground">Total Slots</div>
                                <div className="mt-1 text-lg font-medium">{ data.totalSlots }</div>
                            </div>
                            <div className="rounded-xl border p-4">
                                <div className="text-xs text-muted-foreground">Window Start</div>
                                <div className="mt-1 text-sm">{ start.toLocaleString() }</div>
                            </div>
                            <div className="rounded-xl border p-4">
                                <div className="text-xs text-muted-foreground">Window End</div>
                                <div className="mt-1 text-sm">{ end.toLocaleString() }</div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
                            { isClaimWindowOpen ? (
                                <span>Claim window is <span className="font-medium text-foreground">OPEN</span>. You can claim now.</span>
                            ) : now < start ? (
                                <span>Claim window has <span className="font-medium">not started</span> yet.</span>
                            ) : (
                                <span>Claim window is <span className="font-medium">closed</span>.</span>
                            ) }
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button
                            size="lg"
                            onClick={ () => join.mutate() }
                            disabled={ joinDisabled }
                            className="min-w-[140px]"
                        >
                            { join.isPending ? "Joining…" : isClaimWindowOpen ? "Join (Closed)" : "Join Waitlist" }
                        </Button>

                        <Button
                            size="lg"
                            variant="secondary"
                            onClick={ () => claim.mutate() }
                            disabled={ claimDisabled }
                            className="min-w-[140px]"
                        >
                            { claim.isPending ? "Claiming…" : isClaimWindowOpen ? "Claim" : "Claim (Closed)" }
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}