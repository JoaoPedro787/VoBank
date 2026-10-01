import { DashboardService } from "../services/dashboard.service";
import { InMemoryDashboardRepository } from "../repositories/in-memory-dashboard.repository";
import { InMemoryPeopleRepository } from "../../people/repositories/in-memory-people.repository";
import { DashboardInstallmentData } from "../repositories/dashboard.repository.interface";

describe("DashboardService (TDD)", () => {
  let dashboardRepo: InMemoryDashboardRepository;
  let peopleRepo: InMemoryPeopleRepository;
  let dashboardService: DashboardService;
  const userId = "user-123";

  beforeEach(() => {
    dashboardRepo = new InMemoryDashboardRepository();
    peopleRepo = new InMemoryPeopleRepository();
    dashboardService = new DashboardService(dashboardRepo, peopleRepo);
  });

  it("should return empty metrics with titular when no people and no installments exist", async () => {
    const summary = await dashboardService.getMonthlySummary(userId, {
      month: 10,
      year: 2026,
    });

    expect(summary.month).toBe(10);
    expect(summary.year).toBe(2026);
    expect(summary.totalCommitted).toBe(0);
    expect(summary.totalPaid).toBe(0);
    expect(summary.totalPending).toBe(0);
    expect(summary.totalOverdue).toBe(0);
    expect(summary.installmentsCount).toBe(0);
    expect(summary.byPerson).toHaveLength(1);
    expect(summary.byPerson[0].name).toBe("Você (Titular)");
    expect(summary.byPerson[0].isUser).toBe(true);
    expect(summary.byPerson[0].totalCommitted).toBe(0);
  });

  it("should list registered people even if they have no commitments in the month", async () => {
    await peopleRepo.create({
      userId,
      name: "Lucas Silva",
      color: "#10B981",
    });

    const summary = await dashboardService.getMonthlySummary(userId, {
      month: 10,
      year: 2026,
    });

    expect(summary.byPerson).toHaveLength(2);
    const titular = summary.byPerson.find((p) => p.isUser);
    const lucas = summary.byPerson.find((p) => p.name === "Lucas Silva");

    expect(titular).toBeDefined();
    expect(lucas).toBeDefined();
    expect(lucas?.totalCommitted).toBe(0);
    expect(lucas?.color).toBe("#10B981");
  });

  it("should consolidate installments, splits, paid and pending amounts correctly", async () => {
    const person = await peopleRepo.create({
      userId,
      name: "Mariana",
      color: "#EC4899",
    });

    const mockItem: DashboardInstallmentData = {
      installment: {
        id: "inst-1",
        purchaseId: "purch-1",
        installmentNumber: 1,
        amount: "200.00",
        dueDate: new Date("2026-10-25T12:00:00.000Z"),
        billingMonth: 10,
        billingYear: 2026,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      purchase: {
        id: "purch-1",
        description: "Restaurante Família",
        paymentMethod: "credit",
        totalInstallments: 1,
        creditCard: {
          id: "card-1",
          name: "Nubank",
          color: "#820AD1",
        },
      },
      splits: [
        {
          id: "split-1",
          installmentId: "inst-1",
          personId: null, // Titular
          amount: "100.00",
          percentage: "50",
          isPaid: true,
          paidAt: new Date("2026-10-10T10:00:00.000Z"),
          createdAt: new Date(),
          updatedAt: new Date(),
          person: null,
        },
        {
          id: "split-2",
          installmentId: "inst-1",
          personId: person.id,
          amount: "100.00",
          percentage: "50",
          isPaid: false,
          paidAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          person: {
            id: person.id,
            name: person.name,
            color: person.color,
          },
        },
      ],
    };

    dashboardRepo.addItem(userId, mockItem);

    const summary = await dashboardService.getMonthlySummary(userId, {
      month: 10,
      year: 2026,
      referenceDate: "2026-10-15T00:00:00.000Z",
    });

    expect(summary.totalCommitted).toBe(200);
    expect(summary.totalPaid).toBe(100);
    expect(summary.totalPending).toBe(100);
    expect(summary.totalOverdue).toBe(0);
    expect(summary.installmentsCount).toBe(1);

    const titular = summary.byPerson.find((p) => p.isUser);
    expect(titular?.totalCommitted).toBe(100);
    expect(titular?.totalPaid).toBe(100);
    expect(titular?.totalPending).toBe(0);
    expect(titular?.paidCount).toBe(1);

    const mariana = summary.byPerson.find((p) => p.personId === person.id);
    expect(mariana?.totalCommitted).toBe(100);
    expect(mariana?.totalPaid).toBe(0);
    expect(mariana?.totalPending).toBe(100);
    expect(mariana?.pendingCount).toBe(1);
  });

  it("should detect overdue pending installments when dueDate is prior to referenceDate", async () => {
    const person = await peopleRepo.create({
      userId,
      name: "Carlos",
      color: "#F59E0B",
    });

    const mockOverdueItem: DashboardInstallmentData = {
      installment: {
        id: "inst-overdue",
        purchaseId: "purch-2",
        installmentNumber: 1,
        amount: "150.00",
        dueDate: new Date("2026-10-05T12:00:00.000Z"), // Vencido em relação a 2026-10-15
        billingMonth: 10,
        billingYear: 2026,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      purchase: {
        id: "purch-2",
        description: "Supermercado",
        paymentMethod: "credit",
        totalInstallments: 1,
      },
      splits: [
        {
          id: "split-overdue",
          installmentId: "inst-overdue",
          personId: person.id,
          amount: "150.00",
          percentage: "100",
          isPaid: false,
          paidAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          person: {
            id: person.id,
            name: person.name,
            color: person.color,
          },
        },
      ],
    };

    dashboardRepo.addItem(userId, mockOverdueItem);

    const summary = await dashboardService.getMonthlySummary(userId, {
      month: 10,
      year: 2026,
      referenceDate: "2026-10-15T00:00:00.000Z",
    });

    expect(summary.totalCommitted).toBe(150);
    expect(summary.totalOverdue).toBe(150);
    expect(summary.totalPending).toBe(0);

    const carlos = summary.byPerson.find((p) => p.personId === person.id);
    expect(carlos?.totalOverdue).toBe(150);
    expect(carlos?.overdueCount).toBe(1);
    expect(carlos?.splits[0].isOverdue).toBe(true);
  });

  it("should not count already paid installments as overdue even if dueDate is past", async () => {
    const mockPaidPastItem: DashboardInstallmentData = {
      installment: {
        id: "inst-paid-past",
        purchaseId: "purch-3",
        installmentNumber: 1,
        amount: "80.00",
        dueDate: new Date("2026-10-05T12:00:00.000Z"),
        billingMonth: 10,
        billingYear: 2026,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      purchase: {
        id: "purch-3",
        description: "Farmácia",
        paymentMethod: "debit",
        totalInstallments: 1,
      },
      splits: [
        {
          id: "split-paid-past",
          installmentId: "inst-paid-past",
          personId: null,
          amount: "80.00",
          percentage: "100",
          isPaid: true,
          paidAt: new Date("2026-10-04T12:00:00.000Z"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    dashboardRepo.addItem(userId, mockPaidPastItem);

    const summary = await dashboardService.getMonthlySummary(userId, {
      month: 10,
      year: 2026,
      referenceDate: "2026-10-15T00:00:00.000Z",
    });

    expect(summary.totalCommitted).toBe(80);
    expect(summary.totalPaid).toBe(80);
    expect(summary.totalOverdue).toBe(0);
    expect(summary.totalPending).toBe(0);
  });

  it("should reject invalid query month or year", async () => {
    await expect(
      dashboardService.getMonthlySummary(userId, {
        month: 13,
        year: 2026,
      }),
    ).rejects.toThrow();

    await expect(
      dashboardService.getMonthlySummary(userId, {
        month: 5,
        year: 1990,
      }),
    ).rejects.toThrow();
  });
});
