'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
    const router = useRouter();

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            router.replace("/");
        }
    }, [router]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setPending(true);
            await api.post("/auth/signup", { email, password });
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
        <main className="min-h-screen grid place-items-center bg-gradient-to-b from-background via-background to-muted/30 px-4">
            <Card className="w-full max-w-md border-muted-foreground/10 shadow-sm backdrop-blur">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl tracking-tight">Create account</CardTitle>
                    <CardDescription>Join the Dropspot experience</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e)=>setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e)=>setPassword(e.target.value)}
                                placeholder="Min 6 characters"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={pending}>
                            {pending ? "Creating…" : "Create account"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
          <span>
            Already have an account?{" "}
              <a href="/login" className="underline">Sign in</a>
          </span>
                </CardFooter>
            </Card>
        </main>
    );
}