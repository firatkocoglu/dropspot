'use client';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function LogoutButton() {
    const router = useRouter();
    const qc = useQueryClient();

    const logout = useMutation({
        mutationFn: async () => api.post('/auth/logout'),
        onSuccess: () => {
            localStorage.removeItem('accessToken');
            qc.clear();
            toast.success('Logged out');
            router.push('/login');
        },
        onError: () => toast.error('Logout failed'),
    });

    return (
        <Button variant="secondary" onClick={ () => logout.mutate() } disabled={ logout.isPending }>
            { logout.isPending ? 'Logging out…' : 'Logout' }
        </Button>
    );
}