import { eq, and } from "drizzle-orm";
import { db } from "../../shared/db";
import { people, Person, NewPerson } from "../schemas/people.schema";
import { IPeopleRepository } from "./people.repository.interface";

export class DrizzlePeopleRepository implements IPeopleRepository {
  async findByUserId(userId: string): Promise<Person[]> {
    return db.select().from(people).where(eq(people.userId, userId));
  }

  async findById(id: string, userId: string): Promise<Person | null> {
    const result = await db
      .select()
      .from(people)
      .where(and(eq(people.id, id), eq(people.userId, userId)))
      .limit(1);
    return result[0] || null;
  }

  async create(person: NewPerson): Promise<Person> {
    const result = await db.insert(people).values(person).returning();
    return result[0];
  }

  async update(id: string, userId: string, data: Partial<NewPerson>): Promise<Person | null> {
    const result = await db
      .update(people)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(people.id, id), eq(people.userId, userId)))
      .returning();
    return result[0] || null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(people)
      .where(and(eq(people.id, id), eq(people.userId, userId)))
      .returning();
    return result.length > 0;
  }
}
