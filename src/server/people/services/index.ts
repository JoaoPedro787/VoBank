import { PeopleService } from "./people.service";
import { DrizzlePeopleRepository } from "../repositories/drizzle-people.repository";

let peopleServiceInstance: PeopleService | null = null;

export function getPeopleService(): PeopleService {
  if (!peopleServiceInstance) {
    peopleServiceInstance = new PeopleService(new DrizzlePeopleRepository());
  }
  return peopleServiceInstance;
}

export function setPeopleService(service: PeopleService | null): void {
  peopleServiceInstance = service;
}

export * from "./people.service";
export { InMemoryPeopleRepository } from "../repositories/in-memory-people.repository";
