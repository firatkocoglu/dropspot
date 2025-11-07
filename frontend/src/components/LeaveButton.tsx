'use client';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LeaveButton({ dropId }: { dropId: string }) {
    const qc = useQueryClient();

    const leave = useMutation({
        mutationFn: async () => api.post(`/drops/${dropId}/leave`),
        onSuccess: () => {
            toast.success("You have left the waitlist");
            // drop veya drops listesini yeniden yükle
            qc.invalidateQueries({ queryKey: ["drop", dropId] });
            qc.invalidateQueries({ queryKey: ["drops"] });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Leave failed"),
    });

    return (
        <Button
            size="lg"
            variant="destructive"
            onClick={(e) => {
                e.stopPropagation();
                leave.mutate()}}
            disabled={leave.isPending}
            className="min-w-[140px]"
        >
            {leave.isPending ? "Leaving…" : "Leave Waitlist"}
        </Button>
    );
}