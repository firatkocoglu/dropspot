'use client';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";

export function ClaimButton({ dropId, disabled }: { dropId: string, disabled?: boolean}) {

    const router = useRouter();

    const claim = useMutation({
        mutationFn: async () => (await api.post(`/drops/${ dropId }/claim`)).data,
        onSettled: () => {
            router.push(`/drops/${ dropId }/claim`);
        }
    });

    return (
        <Button
        size="lg"
        onClick={(e) => {
            e.stopPropagation();
            claim.mutate();
        }}
        disabled={disabled || claim.isPending}
        className="text-white bg-violet-400 hover:bg-violet-300 focus:ring-4 focus:ring-blue-300"
        >
             { claim.isPending ? 'Claiming…' : 'Claim' }
        </Button>
    );
}