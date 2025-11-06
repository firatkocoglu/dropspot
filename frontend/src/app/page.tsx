'use client';
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { DropCard } from "@/components/DropCard";
import { LogoutButton } from "@/components/LogoutButton";

export default function HomePage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["drops"],
        queryFn: async () => (await api.get("/drops")).data,
    });

    if ( isLoading ) return <div>Loading drops…</div>;
    if ( isError ) {
        toast.error("Failed to load drops");
        return null;
    }

    console.log(data);

    return (
        <main className="container mx-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Drops</h1>
                <LogoutButton/>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                { data?.drops.map((d: any) => (
                    <DropCard key={ d.id } { ...d } />
                )) }
            </div>
        </main>
    );
}