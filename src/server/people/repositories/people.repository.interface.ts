import { Person, NewPerson } from "../schemas/people.schema";

export interface IPeopleRepository {
  findByUserId(userId: string): Promise<Person[]>;
  findById(id: string, userId: string): Promise<Person | null>;
  create(person: NewPerson): Promise<Person>;
  update(id: string, userId: string, data: Partial<NewPerson>): Promise<Person | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
