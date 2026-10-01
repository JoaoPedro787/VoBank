import { getPurchasesService } from "../../../../server/purchases/services";
import { requireAuth } from "../../../../server/auth/middleware/auth.middleware";
import { toggleInstallmentSplitPaidSchema } from "../../../../server/purchases/schemas/purchases.schema";
import { apiSuccess, handleApiError } from "../../../../server/shared/utils/api-response";

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
  // /api/installments/:id/toggle-paid
  const segments = url.pathname.split("/").filter(Boolean);
  const togglePaidIndex = segments.lastIndexOf("toggle-paid");
  if (togglePaidIndex > 0) {
    return segments[togglePaidIndex - 1];
  }
  return segments[segments.length - 1] || "";
}

export async function PATCH(request: Request, contextOrParams?: RouteContext): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const id = extractId(request, contextOrParams);
    const body = await request.json();
    const validated = toggleInstallmentSplitPaidSchema.parse(body);

    const purchasesService = getPurchasesService();
    const updated = await purchasesService.toggleSplitPaid(id, authUser.userId, validated.isPaid);

    return apiSuccess(updated, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, contextOrParams?: RouteContext): Promise<Response> {
  return PATCH(request, contextOrParams);
}
