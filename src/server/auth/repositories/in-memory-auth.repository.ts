import { User, NewUser } from "../schemas/auth.schema";
import { IAuthRepository } from "./auth.repository.interface";

export class InMemoryAuthRepository implements IAuthRepository {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  async create(user: NewUser): Promise<User> {
    const now = new Date();
    const newUser: User = {
      id:
        user.id ||
        (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`),
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt || now,
      updatedAt: user.updatedAt || now,
    };

    this.users.push(newUser);
    return { ...newUser };
  }

  clear(): void {
    this.users = [];
  }

  getAll(): User[] {
    return [...this.users];
  }
}
