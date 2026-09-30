import { getCreditCardsService } from "../../../server/credit-cards/services";
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
    const cardsService = getCreditCardsService();
    const card = await cardsService.getCard(id, authUser.userId);

    return apiSuccess(card, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, contextOrParams?: RouteContext): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const id = extractId(request, contextOrParams);
    const body = await request.json();
    const cardsService = getCreditCardsService();
    const updated = await cardsService.updateCard(id, authUser.userId, body);

    return apiSuccess(updated, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, contextOrParams?: RouteContext): Promise<Response> {
  return PUT(request, contextOrParams);
}

export async function DELETE(request: Request, contextOrParams?: RouteContext): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const id = extractId(request, contextOrParams);
    const cardsService = getCreditCardsService();
    await cardsService.deleteCard(id, authUser.userId);

    return apiSuccess({ message: "Cartão removido com sucesso" }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
