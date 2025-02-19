import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    basePath: "/api/auth",
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000 // 5 minutes
});