import { IPeopleRepository } from "../repositories/people.repository.interface";
import {
  CreatePersonInput,
  UpdatePersonInput,
  PersonResponse,
  createPersonSchema,
  updatePersonSchema,
} from "../schemas/people.schema";
import { NotFoundError } from "../../shared/errors/app-error";

export class PeopleService {
  constructor(private peopleRepo: IPeopleRepository) {}

  async listPeople(userId: string): Promise<PersonResponse[]> {
    const people = await this.peopleRepo.findByUserId(userId);
    return people.map((p) => ({
      id: p.id,
      userId: p.userId,
      name: p.name,
      color: p.color,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async getPerson(id: string, userId: string): Promise<PersonResponse> {
    const person = await this.peopleRepo.findById(id, userId);
    if (!person) {
      throw new NotFoundError("Pessoa não encontrada");
    }

    return {
      id: person.id,
      userId: person.userId,
      name: person.name,
      color: person.color,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
    };
  }

  async createPerson(userId: string, input: CreatePersonInput): Promise<PersonResponse> {
    const validated = createPersonSchema.parse(input);

    const created = await this.peopleRepo.create({
      userId,
      name: validated.name,
      color: validated.color,
    });

    return {
      id: created.id,
      userId: created.userId,
      name: created.name,
      color: created.color,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async updatePerson(
    id: string,
    userId: string,
    input: UpdatePersonInput,
  ): Promise<PersonResponse> {
    const validated = updatePersonSchema.parse(input);

    const updated = await this.peopleRepo.update(id, userId, validated);
    if (!updated) {
      throw new NotFoundError("Pessoa não encontrada");
    }

    return {
      id: updated.id,
      userId: updated.userId,
      name: updated.name,
      color: updated.color,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deletePerson(id: string, userId: string): Promise<void> {
    const deleted = await this.peopleRepo.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError("Pessoa não encontrada");
    }
  }
}
