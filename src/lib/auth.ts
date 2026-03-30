import { betterAuth } from "better-auth"
import Database from "better-sqlite3"

export const auth = betterAuth({
  database: new Database(process.env.DATABASE_URL ?? "./local.db"),
  emailAndPassword: {
    enabled: true,
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
