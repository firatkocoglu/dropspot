import "@testing-library/jest-dom";

// next/navigation mock (router & params)
vi.mock("next/navigation", () => {
    const push = vi.fn(), replace = vi.fn(), back = vi.fn();
    return {
        useRouter: () => ({ push, replace, back }),
        useParams: () => ({ id: "drop-1" }),
    };
});

// localStorage shim
class LocalStorageMock {
    store: Record<string,string> = {};
    getItem(k:string){ return this.store[k] ?? null }
    setItem(k:string,v:string){ this.store[k]=String(v) }
    removeItem(k:string){ delete this.store[k] }
    clear(){ this.store = {} }
}
Object.defineProperty(window, "localStorage", { value: new LocalStorageMock() });

// minimal QueryClient wrapper
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
export function withQuery(children: ReactNode) {
    const qc = new QueryClient();
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}