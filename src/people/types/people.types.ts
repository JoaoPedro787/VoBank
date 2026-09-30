import {
  PersonResponse,
  CreatePersonInput,
  UpdatePersonInput,
} from "@/server/people/schemas/people.schema";

export type Person = PersonResponse;
export type CreatePersonData = CreatePersonInput;
export type UpdatePersonData = UpdatePersonInput;
