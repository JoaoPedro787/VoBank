import { getPurchasesService } from "../../server/purchases/services";
import { requireAuth } from "../../server/auth/middleware/auth.middleware";
import { apiSuccess, handleApiError } from "../../server/shared/utils/api-response";

export async function GET(request: Request): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const purchasesService = getPurchasesService();
    const purchases = await purchasesService.listPurchases(authUser.userId);

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
