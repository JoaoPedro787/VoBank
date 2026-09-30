import { Person, NewPerson } from "../schemas/people.schema";
import { IPeopleRepository } from "./people.repository.interface";

export class InMemoryPeopleRepository implements IPeopleRepository {
  private people: Person[] = [];

  async findByUserId(userId: string): Promise<Person[]> {
    return this.people.filter((p) => p.userId === userId).map((p) => ({ ...p }));
  }

  async findById(id: string, userId: string): Promise<Person | null> {
    const person = this.people.find((p) => p.id === id && p.userId === userId);
    return person ? { ...person } : null;
  }

  async create(person: NewPerson): Promise<Person> {
    const now = new Date();
    const newPerson: Person = {
      id:
        person.id ||
        (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `person-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`),
      userId: person.userId,
      name: person.name,
      color: person.color,
      createdAt: person.createdAt || now,
      updatedAt: person.updatedAt || now,
    };

    this.people.push(newPerson);
    return { ...newPerson };
  }

  async update(id: string, userId: string, data: Partial<NewPerson>): Promise<Person | null> {
    const index = this.people.findIndex((p) => p.id === id && p.userId === userId);
    if (index === -1) {
      return null;
    }

    const current = this.people[index];
    const updated: Person = {
      ...current,
      ...data,
      updatedAt: new Date(),
    };

    this.people[index] = updated;
    return { ...updated };
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const index = this.people.findIndex((p) => p.id === id && p.userId === userId);
    if (index === -1) {
      return false;
    }

    this.people.splice(index, 1);
    return true;
  }

  clear(): void {
    this.people = [];
  }

  getAll(): Person[] {
    return [...this.people];
  }
}
