'use client';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type JoinButtonProps = {
    dropId: string;
    disabled?: boolean;
    onJoined?: () => void;
    className?: string;
};

export function JoinButton({ dropId, disabled, onJoined }: JoinButtonProps) {
    const qc = useQueryClient();

    const join = useMutation({
        mutationFn: async () => api.post(`/drops/${dropId}/join`),
        onSuccess: () => {
            toast.success("Joined waitlist successfully!");
            qc.invalidateQueries({ queryKey: ["drop", dropId] });
            qc.invalidateQueries({ queryKey: ["drops"] });
            onJoined?.();
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message;
            if (msg?.includes("ALREADY_JOINED")) {
                toast.info("Already in waitlist");
            } else {
                toast.error(msg ?? "Failed to join waitlist");
            }
        },
    });

    return (
        <Button
            size="lg"
            onClick={(e) => {
                e.stopPropagation();
                join.mutate()}}
            disabled={join.isPending || disabled}
            className="text-white bg-blue-600 hover:bg-blue-300 focus:ring-4 focus:ring-blue-300"
        >
            {join.isPending
                ? "Joining..."
                : disabled
                    ? "Join (Closed)"
                    : "Join Waitlist"}
        </Button>
    );
}