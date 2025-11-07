'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Drop } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { BadgeCheckIcon, ScrollText } from "lucide-react";

export function DropCard({ id, title, totalSlots, claimWindowStart, claimWindowEnd, isActive, waitlists }: Drop) {
    const router = useRouter();

    const now = new Date();
    const windowStart = new Date(claimWindowStart);
    const windowEnd = new Date(claimWindowEnd);
    const isClaimWindowOpen = now >= windowStart && now <= windowEnd;
    const joinedWaitlist = waitlists && waitlists.length > 0;

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
                { joinedWaitlist && (
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
                <Button
                    variant="secondary"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/drops/${id}`);
                    }}
                >
                    View Details
                </Button>
            </CardFooter>
        </Card>
    );
}