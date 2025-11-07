'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserFromToken } from "@/lib/getUserFromToken";

export function AdminPanelButton() {
    const payload = getUserFromToken();
    const isAdmin = payload?.role === "ADMIN";

    if (!isAdmin) return null;

    return (
        <Link href="/admin/drops">
            <Button variant="secondary">Admin Panel</Button>
        </Link>
    );
}