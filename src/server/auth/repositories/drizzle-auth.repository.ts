import { eq } from "drizzle-orm";
import { db } from "../../shared/db";
import { users, User, NewUser } from "../schemas/auth.schema";
import { IAuthRepository } from "./auth.repository.interface";

export class DrizzleAuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async create(user: NewUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
}
