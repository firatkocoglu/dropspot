'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import type { Drop } from "@/lib/types";
import { useRouter } from "next/navigation";


export function DropCard({ id, title, totalSlots, claimWindowStart, claimWindowEnd, isActive }: Drop) {
    const qc = useQueryClient();
    const router = useRouter();

    const now = new Date();
    const windowStart = new Date(claimWindowStart);
    const windowEnd = new Date(claimWindowEnd);
    const isClaimWindowOpen = now >= windowStart && now <= windowEnd;

    // Join mutation
    const join = useMutation({
        mutationFn: async () => api.post(`/drops/${ id }/join`),
        onSuccess: () => {
            toast.success("Joined waitlist");
            qc.invalidateQueries({ queryKey: ["drops"] });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Join failed"),
    });

    //  Claim mutation
    const claim = useMutation({
        mutationFn: async () => (await api.post(`/drops/${ id }/claim`)).data,
        onSuccess: (res) => toast.success(`Your code: ${ res.code }`),
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Claim failed"),
    });

    return (
        <Card
            onClick={ () => router.push(`/drops/${ id }`) }
            className="shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
            <CardHeader>
                <CardTitle className="text-lg">{ title }</CardTitle>
                <CardDescription className="space-y-1">
                    <div className="text-sm">Total slots: { totalSlots }</div>
                    <div className="text-xs">
                        Claim window: { windowStart.toLocaleString() } → { windowEnd.toLocaleString() }
                    </div>
                </CardDescription>
            </CardHeader>

            <CardContent>
                <span className="text-xs">{ isActive ? "Active" : "Inactive" }</span>
            </CardContent>

            <CardFooter className="flex gap-2">
                {/* 🧍 Join Waitlist */ }
                <Button
                    size="sm"
                    onClick={ () => join.mutate() }
                    disabled={ join.isPending || isClaimWindowOpen }
                >
                    { join.isPending
                        ? "Joining…"
                        : isClaimWindowOpen
                            ? "Join (Closed)"
                            : "Join" }
                </Button>

                {/* Claim */ }
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={ () => claim.mutate() }
                    disabled={ !isClaimWindowOpen || claim.isPending }
                >
                    { claim.isPending
                        ? "Claiming…"
                        : isClaimWindowOpen
                            ? "Claim"
                            : "Claim (Closed)" }
                </Button>
            </CardFooter>
        </Card>
    );
}