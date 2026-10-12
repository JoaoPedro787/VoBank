import {
  DashboardResponse,
  DashboardQueryInput,
  dashboardQuerySchema,
  DashboardSplitItem,
  PersonDashboardSummary,
} from "../schemas/dashboard.schema";
import { IDashboardRepository } from "../repositories/dashboard.repository.interface";
import { IPeopleRepository } from "../../people/repositories/people.repository.interface";

function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export class DashboardService {
  constructor(
    private dashboardRepo: IDashboardRepository,
    private peopleRepo: IPeopleRepository,
  ) {}

  async getMonthlySummary(userId: string, query?: DashboardQueryInput): Promise<DashboardResponse> {
    const validated = dashboardQuerySchema.parse(query || {});

    const now = validated.referenceDate ? new Date(validated.referenceDate) : new Date();
    const month = validated.month ?? now.getUTCMonth() + 1;
    const year = validated.year ?? now.getUTCFullYear();

    const todayStr = now.toISOString().slice(0, 10);

    // 1. Obter todas as pessoas cadastradas pelo usuário
    const peopleList = await this.peopleRepo.findByUserId(userId);

    // 2. Obter todas as parcelas e rateios do mês especificado
    const monthlyInstallments = await this.dashboardRepo.findMonthlyInstallments(
      userId,
      month,
      year,
    );

    // 3. Inicializar mapa de pessoas (Titular + Pessoas cadastradas)
    const peopleMap = new Map<string, PersonDashboardSummary>();

    // Titular
    peopleMap.set("user", {
      personId: null,
      name: "Você (Titular)",
      color: "#3B82F6",
      isUser: true,
      totalCommitted: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0,
      totalSplitsCount: 0,
      splits: [],
    });

    // Pessoas cadastradas
    for (const p of peopleList) {
      peopleMap.set(p.id, {
        personId: p.id,
        name: p.name,
        color: p.color,
        isUser: false,
        totalCommitted: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        paidCount: 0,
        pendingCount: 0,
        overdueCount: 0,
        totalSplitsCount: 0,
        splits: [],
      });
    }

    // 4. Processar cada parcela e seus rateios
    for (const instItem of monthlyInstallments) {
      const { installment, purchase, splits } = instItem;
      const dueStr = new Date(installment.dueDate).toISOString().slice(0, 10);

      for (const split of splits) {
        const amount = parseFloat(String(split.amount)) || 0;
        const isOverdue = !split.isPaid && dueStr < todayStr;

        const splitItem: DashboardSplitItem = {
          id: split.id,
          installmentId: installment.id,
          purchaseId: purchase.id,
          purchaseDescription: purchase.description,
          paymentMethod: purchase.paymentMethod,
          creditCardName: purchase.creditCard?.name || null,
          installmentNumber: installment.installmentNumber,
          totalInstallments: purchase.totalInstallments,
          amount,
          dueDate: new Date(installment.dueDate).toISOString(),
          billingMonth: installment.billingMonth,
          billingYear: installment.billingYear,
          isPaid: split.isPaid,
          paidAt: split.paidAt ? new Date(split.paidAt).toISOString() : null,
          isOverdue,
        };

        const targetKey = split.personId ? split.personId : "user";
        let personSummary = peopleMap.get(targetKey);

        if (!personSummary) {
          personSummary = {
            personId: split.personId,
            name: split.person?.name || "Desconhecido",
            color: split.person?.color || "#71717a",
            isUser: false,
            totalCommitted: 0,
            totalPaid: 0,
            totalPending: 0,
            totalOverdue: 0,
            paidCount: 0,
            pendingCount: 0,
            overdueCount: 0,
            totalSplitsCount: 0,
            splits: [],
          };
          peopleMap.set(targetKey, personSummary);
        }

        personSummary.totalCommitted += amount;
        personSummary.totalSplitsCount += 1;

        if (split.isPaid) {
          personSummary.totalPaid += amount;
          personSummary.paidCount += 1;
        } else if (isOverdue) {
          personSummary.totalOverdue += amount;
          personSummary.overdueCount += 1;
        } else {
          personSummary.totalPending += amount;
          personSummary.pendingCount += 1;
        }

        personSummary.splits.push(splitItem);
      }
    }

    // 5. Arredondar valores e computar totais globais
    let totalCommitted = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    const byPerson: PersonDashboardSummary[] = [];

    for (const summary of peopleMap.values()) {
      summary.totalCommitted = round2(summary.totalCommitted);
      summary.totalPaid = round2(summary.totalPaid);
      summary.totalPending = round2(summary.totalPending);
      summary.totalOverdue = round2(summary.totalOverdue);

      totalCommitted += summary.totalCommitted;
      totalPaid += summary.totalPaid;
      totalPending += summary.totalPending;
      totalOverdue += summary.totalOverdue;

      // Ordenar splits por data de vencimento
      summary.splits.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      byPerson.push(summary);
    }

    return {
      month,
      year,
      totalCommitted: round2(totalCommitted),
      totalPaid: round2(totalPaid),
      totalPending: round2(totalPending),
      totalOverdue: round2(totalOverdue),
      installmentsCount: monthlyInstallments.length,
      byPerson,
    };
  }
}
