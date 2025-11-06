'use client';

import {Drop} from "@/lib/types";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";

export function DropCard({id, title, description, totalSlots, claimWindowStart, claimWindowEnd, isActive }: Drop) {
    const router = useRouter();
    const windowStart = new Date(claimWindowStart).toLocaleString();
    const windowEnd = new Date(claimWindowEnd).toLocaleString();

    return (
        <Card className="shadow-sm hover:shadow-md transition-all">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                <CardDescription>
                    <div className="text-sm text-muted-foreground">Total slots: {totalSlots}</div>
                    <div className="text-xs text-muted-foreground">
                        Claim window: {windowStart} → {windowEnd}
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
            </CardContent>
            <CardFooter>
                <Button size="sm" className="w-full" onClick={() => router.push(`/drops/${id}`)}>
                    View Details
                </Button>
            </CardFooter>
        </Card>
    )
}