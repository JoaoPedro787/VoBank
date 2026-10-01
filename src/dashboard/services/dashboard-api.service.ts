import { getBaseApiUrl } from "@/shared/lib/api-config";
import { DashboardResponseClient } from "../types/dashboard.types";

export const dashboardApiService = {
  async getSummary(token: string, month?: number, year?: number): Promise<DashboardResponseClient> {
    const baseUrl = getBaseApiUrl();
    const params = new URLSearchParams();
    if (month) params.append("month", String(month));
    if (year) params.append("year", String(year));

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${baseUrl}/api/dashboard${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao carregar dados do dashboard");
    }

    return result as DashboardResponseClient;
  },
};
