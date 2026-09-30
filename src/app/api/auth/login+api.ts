import { getAuthService } from "../../../server/auth/services";
import { apiSuccess, handleApiError } from "../../../server/shared/utils/api-response";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const authService = getAuthService();
    const result = await authService.login(body);

    return apiSuccess(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
