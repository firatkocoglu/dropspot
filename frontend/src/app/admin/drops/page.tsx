
'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { HomeIcon } from "lucide-react";

// ------- Tiny type (keep it simple)
type Drop = {
    id: string;
    title: string;
    description: string;
    totalSlots: number;
    claimWindowStart: string;
    claimWindowEnd: string;
    isActive: boolean;
};

// ------- One-page guard (quick)
export default function AdminDropsPage() {
    const router = useRouter();
    const qc = useQueryClient();

    useEffect(() => {
        const t = localStorage.getItem("accessToken");
        if (!t) router.replace("/login");
    }, [router]);

    // ------- Fetch list
    const { data, isLoading } = useQuery<Drop[]>({
        queryKey: ["admin-drops"],
        queryFn: async () => (await api.get("/drops")).data,
    });

    // ------- Create (inline form top)
    const [newForm, setNewForm] = useState({
        title: "",
        description: "",
        totalSlots: 50,
        claimWindowStart: "",
        claimWindowEnd: "",
        isActive: true,
    });

    const createMut = useMutation({
        mutationFn: async () =>
            api.post("/drops", {
                ...newForm,
                claimWindowStart: newForm.claimWindowStart ? new Date(newForm.claimWindowStart).toISOString() : null,
                claimWindowEnd: newForm.claimWindowEnd ? new Date(newForm.claimWindowEnd).toISOString() : null,
            }),
        onSuccess: () => {
            toast.success("Created");
            setNewForm({
                title: "",
                description: "",
                totalSlots: 50,
                claimWindowStart: "",
                claimWindowEnd: "",
                isActive: true,
            });
            qc.invalidateQueries({ queryKey: ["admin-drops"] });
        },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? "Create failed"),
    });

    // ------- Update (inline per-row)

    const updateMut = useMutation({
        mutationFn: async (payload: Partial<Drop> & { id: string }) =>
            api.patch(`/drops/${payload.id}`, {
                ...payload,
                claimWindowStart: payload.claimWindowStart ? new Date(payload.claimWindowStart).toISOString() : undefined,
                claimWindowEnd: payload.claimWindowEnd ? new Date(payload.claimWindowEnd).toISOString() : undefined,
            }),
        onSuccess: () => {
            toast.success("Saved");
            qc.invalidateQueries({ queryKey: ["admin-drops"] });
        },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? "Save failed"),
    });

    // ------- Delete (simple confirm)
    const deleteMut = useMutation({
        mutationFn: async (id: string) => api.delete(`/drops/${id}`),
        onSuccess: () => {
            toast.success("Deleted");
            qc.invalidateQueries({ queryKey: ["admin-drops"] });
        },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? "Delete failed"),
    });

    // ------- Editable row local state holder
    const [editing, setEditing] = useState<Record<string, Partial<Drop>>>({});

    if (isLoading) return <div className="p-6">Loading…</div>;

    return (
        <main className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Admin · Drops</h1>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2"
                    >
                        <HomeIcon className="h-4 w-4" />
                        Home
                    </Button>
                </div>
            </div>

            {/* CREATE INLINE */}
            <Card className="p-4 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                    <div>
                        <label className="text-xs">Title</label>
                        <Input
                            value={newForm.title}
                            onChange={(e) => setNewForm((s) => ({ ...s, title: e.target.value }))}
                            placeholder="Title"
                        />
                    </div>
                    <div>
                        <label className="text-xs">Total Slots</label>
                        <Input
                            type="number"
                            min={1}
                            value={newForm.totalSlots}
                            onChange={(e) => setNewForm((s) => ({ ...s, totalSlots: Number(e.target.value) || 0 }))}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs">Description</label>
                        <Textarea
                            rows={2}
                            value={newForm.description}
                            onChange={(e) => setNewForm((s) => ({ ...s, description: e.target.value }))}
                            placeholder="Short description"
                        />
                    </div>
                    <div>
                        <label className="text-xs">Claim Start</label>
                        <Input
                            type="datetime-local"
                            value={newForm.claimWindowStart}
                            onChange={(e) => setNewForm((s) => ({ ...s, claimWindowStart: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="text-xs">Claim End</label>
                        <Input
                            type="datetime-local"
                            value={newForm.claimWindowEnd}
                            onChange={(e) => setNewForm((s) => ({ ...s, claimWindowEnd: e.target.value }))}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs">Active</label>
                        <Switch
                            checked={newForm.isActive}
                            onCheckedChange={(v) => setNewForm((s) => ({ ...s, isActive: v }))}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
                        {createMut.isPending ? "Creating…" : "Create"}
                    </Button>
                </div>
            </Card>

            {/* LIST + INLINE EDIT */}
            <Card className="p-0 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                    <tr className="text-left">
                        <th className="py-2 px-3">Title</th>
                        <th className="py-2 px-3 w-[120px]">Slots</th>
                        <th className="py-2 px-3">Start</th>
                        <th className="py-2 px-3">End</th>
                        <th className="py-2 px-3 w-[90px]">Active</th>
                        <th className="py-2 px-3 w-[190px]">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data?.drops.map((d) => {
                        const row = editing[d.id] ?? {};
                        const isEdit = !!editing[d.id];

                        return (
                            <tr key={d.id} className="border-t">
                                <td className="py-2 px-3">
                                    {isEdit ? (
                                        <Input
                                            defaultValue={d.title}
                                            onChange={(e) => (row.title = e.target.value)}
                                        />
                                    ) : (
                                        <div className="font-medium">{d.title}</div>
                                    )}
                                    <div className="text-xs text-muted-foreground line-clamp-2">
                                        {isEdit ? (
                                            <Textarea
                                                defaultValue={d.description}
                                                rows={2}
                                                onChange={(e) => (row.description = e.target.value)}
                                            />
                                        ) : (
                                            d.description
                                        )}
                                    </div>
                                </td>

                                <td className="py-2 px-3">
                                    {isEdit ? (
                                        <Input
                                            type="number"
                                            defaultValue={d.totalSlots}
                                            onChange={(e) => (row.totalSlots = Number(e.target.value))}
                                        />
                                    ) : (
                                        d.totalSlots
                                    )}
                                </td>

                                <td className="py-2 px-3">
                                    {isEdit ? (
                                        <Input
                                            type="datetime-local"
                                            defaultValue={new Date(d.claimWindowStart).toISOString().slice(0, 16)}
                                            onChange={(e) => (row.claimWindowStart = e.target.value)}
                                        />
                                    ) : (
                                        new Date(d.claimWindowStart).toLocaleString()
                                    )}
                                </td>

                                <td className="py-2 px-3">
                                    {isEdit ? (
                                        <Input
                                            type="datetime-local"
                                            defaultValue={new Date(d.claimWindowEnd).toISOString().slice(0, 16)}
                                            onChange={(e) => (row.claimWindowEnd = e.target.value)}
                                        />
                                    ) : (
                                        new Date(d.claimWindowEnd).toLocaleString()
                                    )}
                                </td>

                                <td className="py-2 px-3">
                                    {isEdit ? (
                                        <Switch
                                            defaultChecked={d.isActive}
                                            onCheckedChange={(v) => (row.isActive = v)}
                                        />
                                    ) : (
                                        <span className="text-xs">{d.isActive ? "Yes" : "No"}</span>
                                    )}
                                </td>

                                <td className="py-2 px-3">
                                    {!isEdit ? (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() =>
                                                    setEditing((s) => ({ ...s, [d.id]: { id: d.id } }))
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    if (confirm("Delete this drop?")) deleteMut.mutate(d.id);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    const payload: Partial<Drop> & { id: string } = { id: d.id, ...row };
                                                    updateMut.mutate(payload);
                                                    setEditing((s) => {
                                                        const { [d.id]: _, ...rest } = s;
                                                        return rest;
                                                    });
                                                }}
                                                disabled={updateMut.isPending}
                                            >
                                                {updateMut.isPending ? "Saving…" : "Save"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    setEditing((s) => {
                                                        const { [d.id]: _, ...rest } = s;
                                                        return rest;
                                                    })
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </Card>
        </main>
    );
}