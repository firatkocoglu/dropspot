'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setPending(true);
            const { data } = await api.post("/auth/login", { email, password });
            // backend body: { accessToken, user }
            localStorage.setItem("accessToken", data.accessToken);
            toast.success("Welcome back!");
            router.push("/");
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Login failed");
        } finally {
            setPending(false);
        }
    }

    return (
        <main className="container mx-auto max-w-md p-6">
            <h1 className="text-2xl font-semibold mb-4">Login</h1>
            <form onSubmit={ onSubmit } className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm">Email</label>
                    <input
                        type="email"
                        required
                        value={ email }
                        onChange={ (e) => setEmail(e.target.value) }
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="you@example.com"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm">Password</label>
                    <input
                        type="password"
                        required
                        value={ password }
                        onChange={ (e) => setPassword(e.target.value) }
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="••••••••"
                    />
                </div>
                <Button type="submit" disabled={ pending } className="w-full">
                    { pending ? "Signing in..." : "Sign in" }
                </Button>
                <p className="text-sm text-muted-foreground">
                    Don’t have an account? <a href="/signup" className="underline">Sign up</a>
                </p>
            </form>
        </main>
    );
}