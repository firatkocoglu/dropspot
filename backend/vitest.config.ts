import {defineConfig} from "vitest/config";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        environment: "node",
        include: ["tests/**/*.test.ts"],
        // optional coverage setup
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),         // for imports like "@/services/claim.service"
            "@prisma/client": path.resolve(__dirname, "./node_modules/@prisma/client"),
            "@lib/prisma": path.resolve(__dirname, "./src/lib/prisma"), // optional shortcut if you want "@/lib/prisma"
        },
    },
});