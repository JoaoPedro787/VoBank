import { getPurchasesService } from "../../server/purchases/services";
import { requireAuth } from "../../server/auth/middleware/auth.middleware";
import { apiSuccess, handleApiError } from "../../server/shared/utils/api-response";

export async function GET(request: Request): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const url = new URL(request.url);
    const queryParams: Record<string, string> = {};

    const month = url.searchParams.get("month");
    if (month) queryParams.month = month;
    const year = url.searchParams.get("year");
    if (year) queryParams.year = year;
    const creditCardId = url.searchParams.get("creditCardId");
    if (creditCardId) queryParams.creditCardId = creditCardId;
    const personId = url.searchParams.get("personId");
    if (personId) queryParams.personId = personId;
    const search = url.searchParams.get("search");
    if (search) queryParams.search = search;

    const purchasesService = getPurchasesService();
    const purchases = await purchasesService.listPurchases(
      authUser.userId,
      Object.keys(queryParams).length > 0 ? queryParams : undefined,
    );

    return apiSuccess(purchases, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const body = await request.json();
    const purchasesService = getPurchasesService();
    const created = await purchasesService.createPurchase(authUser.userId, body);

    return apiSuccess(created, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
