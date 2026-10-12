import { DashboardService } from "./dashboard.service";
import { DrizzleDashboardRepository } from "../repositories/drizzle-dashboard.repository";
import { DrizzlePeopleRepository } from "../../people/repositories/drizzle-people.repository";

let dashboardServiceInstance: DashboardService | null = null;

export function getDashboardService(): DashboardService {
  if (!dashboardServiceInstance) {
    dashboardServiceInstance = new DashboardService(
      new DrizzleDashboardRepository(),
      new DrizzlePeopleRepository(),
    );
  }
  return dashboardServiceInstance;
}

export function setDashboardService(service: DashboardService | null): void {
  dashboardServiceInstance = service;
}

export * from "./dashboard.service";
export { InMemoryDashboardRepository } from "../repositories/in-memory-dashboard.repository";
export * from "../repositories/dashboard.repository.interface";
