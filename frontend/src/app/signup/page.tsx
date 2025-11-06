'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setPending(true);
            // Create user
            await api.post("/auth/signup", { email, password });
            // Auto-login after signup
            const { data } = await api.post("/auth/login", { email, password });
            localStorage.setItem("accessToken", data.accessToken);
            toast.success("Account created!");
            router.push("/");
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Signup failed");
        } finally {
            setPending(false);
        }
    }

    return (
        <main className="container mx-auto max-w-md p-6">
            <h1 className="text-2xl font-semibold mb-4">Sign up</h1>
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
                        placeholder="Min 6 chars"
                    />
                </div>
                <Button type="submit" disabled={ pending } className="w-full">
                    { pending ? "Creating..." : "Create account" }
                </Button>
                <p className="text-sm text-muted-foreground">
                    Already have an account? <a href="/login" className="underline">Login</a>
                </p>
            </form>
        </main>
    );
}