import { getCreditCardsService } from "../../server/credit-cards/services";
import { requireAuth } from "../../server/auth/middleware/auth.middleware";
import { apiSuccess, handleApiError } from "../../server/shared/utils/api-response";

export async function GET(request: Request): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const cardsService = getCreditCardsService();
    const cards = await cardsService.listCards(authUser.userId);

    return apiSuccess(cards, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const body = await request.json();
    const cardsService = getCreditCardsService();
    const created = await cardsService.createCard(authUser.userId, body);

    return apiSuccess(created, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
