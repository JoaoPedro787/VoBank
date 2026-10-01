import { IDashboardRepository, DashboardInstallmentData } from "./dashboard.repository.interface";

export class InMemoryDashboardRepository implements IDashboardRepository {
  private items: Array<{
    userId: string;
    data: DashboardInstallmentData;
  }> = [];

  addItem(userId: string, data: DashboardInstallmentData): void {
    this.items.push({ userId, data });
  }

  setItems(items: Array<{ userId: string; data: DashboardInstallmentData }>): void {
    this.items = items;
  }

  clear(): void {
    this.items = [];
  }

  async findMonthlyInstallments(
    userId: string,
    month: number,
    year: number,
  ): Promise<DashboardInstallmentData[]> {
    return this.items
      .filter(
        (item) =>
          item.userId === userId &&
          item.data.installment.billingMonth === month &&
          item.data.installment.billingYear === year,
      )
      .map((item) => item.data);
  }
}
