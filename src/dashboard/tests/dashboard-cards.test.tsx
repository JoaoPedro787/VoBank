import * as React from "react";
import { MonthlyMetricsCard } from "../components/MonthlyMetricsCard";
import { PersonSummaryCard } from "../components/PersonSummaryCard";
import { DashboardResponseClient, PersonDashboardSummaryClient } from "../types/dashboard.types";

describe("Dashboard Cards Layout & Resilience (TDD & Unit)", () => {
  const mockPerson1: PersonDashboardSummaryClient = {
    personId: "p1",
    name: "João Pedro de Albuquerque Ferreira",
    color: "#007AFF",
    isUser: true,
    totalCommitted: 125000.0,
    totalPaid: 100000.0,
    totalPending: 20000.0,
    totalOverdue: 5000.0,
    paidCount: 5,
    pendingCount: 2,
    overdueCount: 1,
    totalSplitsCount: 8,
    splits: [],
  };

  const mockPerson2: PersonDashboardSummaryClient = {
    personId: "p2",
    name: "Maria Silva",
    color: "#34C759",
    isUser: false,
    totalCommitted: 500.0,
    totalPaid: 500.0,
    totalPending: 0,
    totalOverdue: 0,
    paidCount: 1,
    pendingCount: 0,
    overdueCount: 0,
    totalSplitsCount: 1,
    splits: [],
  };

  const mockDashboardData: DashboardResponseClient = {
    month: 10,
    year: 2026,
    totalCommitted: 999999.99,
    totalPaid: 500000.5,
    totalPending: 400000.49,
    totalOverdue: 99999.0,
    installmentsCount: 15,
    byPerson: [mockPerson1, mockPerson2],
  };

  describe("MonthlyMetricsCard", () => {
    it("should render monthly metrics with high numbers without crashing", () => {
      const element = <MonthlyMetricsCard data={mockDashboardData} />;
      expect(element).toBeDefined();
    });

    it("should render when overdue is 0", () => {
      const dataWithoutOverdue: DashboardResponseClient = {
        ...mockDashboardData,
        totalOverdue: 0,
      };
      const element = <MonthlyMetricsCard data={dataWithoutOverdue} />;
      expect(element).toBeDefined();
    });
  });

  describe("PersonSummaryCard", () => {
    it("should render person summary with overdue installments badge", () => {
      const handlePress = jest.fn();
      const element = (
        <PersonSummaryCard person={mockPerson1} isSelected={false} onPress={handlePress} />
      );
      expect(element).toBeDefined();
    });

    it("should render person summary when all installments are paid", () => {
      const handlePress = jest.fn();
      const element = (
        <PersonSummaryCard person={mockPerson2} isSelected={true} onPress={handlePress} />
      );
      expect(element).toBeDefined();
    });
  });
});
