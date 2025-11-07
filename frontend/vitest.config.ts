import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setupTests.tsx"],
        globals: true,
        include: [
            "src/**/*.{test,spec}.{ts,tsx}",
            "src/**/__tests__/**/*.{ts,tsx}"
        ],
    },
    resolve : {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    }
});