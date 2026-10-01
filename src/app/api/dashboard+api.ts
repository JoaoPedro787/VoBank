import { getDashboardService } from "../../server/dashboard/services";
import { requireAuth } from "../../server/auth/middleware/auth.middleware";
import { apiSuccess, handleApiError } from "../../server/shared/utils/api-response";

export async function GET(request: Request): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const url = new URL(request.url);
    const monthParam = url.searchParams.get("month");
    const yearParam = url.searchParams.get("year");
    const refDateParam = url.searchParams.get("referenceDate");

    const dashboardService = getDashboardService();
    const result = await dashboardService.getMonthlySummary(authUser.userId, {
      month: monthParam ? parseInt(monthParam, 10) : undefined,
      year: yearParam ? parseInt(yearParam, 10) : undefined,
      referenceDate: refDateParam || undefined,
    });

    return apiSuccess(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
