import { getPurchasesService } from "../../../server/purchases/services";
import { requireAuth } from "../../../server/auth/middleware/auth.middleware";
import { apiSuccess, handleApiError } from "../../../server/shared/utils/api-response";

type RouteContext = { params?: { id?: string } } | { id?: string };

function extractId(request: Request, contextOrParams?: RouteContext): string {
  if (contextOrParams) {
    if ("params" in contextOrParams && contextOrParams.params?.id) {
      return contextOrParams.params.id;
    }
    if ("id" in contextOrParams && contextOrParams.id) {
      return contextOrParams.id;
    }
  }
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

export async function GET(request: Request, contextOrParams?: RouteContext): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const id = extractId(request, contextOrParams);
    const purchasesService = getPurchasesService();
    const purchase = await purchasesService.getPurchase(id, authUser.userId);

    return apiSuccess(purchase, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, contextOrParams?: RouteContext): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const id = extractId(request, contextOrParams);
    const purchasesService = getPurchasesService();
    await purchasesService.deletePurchase(id, authUser.userId);

    return apiSuccess({ message: "Compra excluída com sucesso" }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
