'use client';

import "./globals.css";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "@/lib/queryClient";
import {Toaster} from "sonner";
import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster richColors position="top-right" expand={false} />
        </QueryClientProvider>
        </body>
        </html>
    );
}