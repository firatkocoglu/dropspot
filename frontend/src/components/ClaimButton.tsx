'use client';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function ClaimButton({ dropId }: { dropId: string }) {
    const claim = useMutation({
        mutationFn: async () => (await api.post(`/drops/${ dropId }/claim`)).data,
        onSuccess: (res) => toast.success(`Your code: ${ res.code }`),
        onError: (err: any) =>
            toast.error(err?.response?.data?.message ?? 'Claim failed'),
    });

    return (
        <Button onClick={ () => claim.mutate() } disabled={ claim.isPending }>
            { claim.isPending ? 'Claiming…' : 'Claim' }
        </Button>
    );
}