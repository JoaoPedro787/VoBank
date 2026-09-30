import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

export const client = connectionString
  ? postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  : (null as unknown as ReturnType<typeof postgres>);

export const db = client
  ? drizzle(client, { schema })
  : new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
      get(_target, prop) {
        throw new Error(
          `DATABASE_URL environment variable is not defined. Cannot access db.${String(prop)}`,
        );
      },
    });

export async function testConnection(): Promise<boolean> {
  if (!client) {
    return false;
  }
  try {
    const result = await client`SELECT 1 as connected`;
    return result.length > 0 && result[0].connected === 1;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}
