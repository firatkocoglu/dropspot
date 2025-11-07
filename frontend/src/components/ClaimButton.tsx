'use client';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function ClaimButton({ dropId, disabled }: { dropId: string, disabled?: boolean }) {
    const claim = useMutation({
        mutationFn: async () => (await api.post(`/drops/${ dropId }/claim`)).data,
        onSuccess: (res) => toast.success(`Your code: ${ res.code }`),
        onError: (err: any) =>
            toast.error(err?.response?.data?.message ?? 'Claim failed'),
    });

    return (
        <Button
        size="lg"
        onClick={(e) => {
            e.stopPropagation();
            claim.mutate()}}
        disabled={claim.isPending || disabled}
        className="text-white bg-violet-400 hover:bg-violet-300 focus:ring-4 focus:ring-blue-300"
        >
             { claim.isPending ? 'Claiming…' : 'Claim' }
        </Button>
    );
}