import 'dotenv/config'

function must(name: string): string {
    const value = process.env[name]
    if (!value) throw new Error(`Missing env var: ${name}`)
    return value;
}

export const env = {
    dbUrl: must('DATABASE_URL'),
    accessSecret: must('ACCESS_TOKEN_SECRET'),
    refreshSecret: must('REFRESH_TOKEN_SECRET'),
    accessTtl: process.env.ACCESS_EXPIRES_IN ?? '15m',
    refreshTtl: process.env.REFRESH_EXPIRES_IN ?? '7d',
    nodeEnv: process.env.NODE_ENV ?? 'development',
}