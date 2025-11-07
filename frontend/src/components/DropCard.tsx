'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import type { Drop } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { BadgeCheckIcon, ScrollText } from "lucide-react";
import { ClaimButton } from "@/components/ClaimButton";
import { JoinButton } from "@/components/JoinButton";
import { LeaveButton } from "@/components/LeaveButton";


export function DropCard({ id, title, totalSlots, claimWindowStart, claimWindowEnd, isActive, waitlists }: Drop) {
    const qc = useQueryClient();
    const router = useRouter();

    const now = new Date();
    const windowStart = new Date(claimWindowStart);
    const windowEnd = new Date(claimWindowEnd);
    const isClaimWindowOpen = now >= windowStart && now <= windowEnd;
    const alreadyJoinedWaitlist = waitlists && waitlists.length > 0;

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
                         {isClaimWindowOpen ? `Claims are currently open until: ${ windowEnd.toLocaleString() }` :  `Claim window: ${ windowStart.toLocaleString() } → ${ windowEnd.toLocaleString() }`}
                    </div>
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Badge
                    variant="secondary"
                    className="bg-green-600 text-white dark:bg-green-400 me-3"
                >
                    <BadgeCheckIcon/>
                    { isActive ? "Active" : "Inactive" }
                </Badge>
                { alreadyJoinedWaitlist && (
                    <Badge
                        variant="secondary"
                        className="bg-blue-500 text-white dark:bg-blue-600 me-3"
                    >
                        <BadgeCheckIcon/> { "Joined Waitlist " }
                    </Badge>
                ) }
                { isClaimWindowOpen &&  (
                    <Badge
                        variant="secondary"
                        className="bg-violet-400 text-white dark:bg-blue-600"
                    >
                        <ScrollText /> { "Claims" }
                    </Badge>
                )}

            </CardContent>

            <CardFooter className="flex gap-2">
                {alreadyJoinedWaitlist ? <LeaveButton dropId={ id } /> :
                <JoinButton dropId={ id } disabled={ join.isPending || isClaimWindowOpen } /> }
                <ClaimButton dropId={ id } disabled={ claim.isPending || !isClaimWindowOpen } />

            </CardFooter>
        </Card>
    );
}