'use client';

import "./globals.css";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "@/lib/queryClient";
import {Toaster} from "sonner";
import React from "react";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={plusJakarta.className}>
        <body>
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster richColors position="top-right" expand={false} />
        </QueryClientProvider>
        </body>
        </html>
    );
}