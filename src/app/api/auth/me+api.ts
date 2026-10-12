import { getAuthService } from "../../../server/auth/services";
import { requireAuth } from "../../../server/auth/middleware/auth.middleware";
import { apiSuccess, handleApiError } from "../../../server/shared/utils/api-response";

export async function GET(request: Request): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const authService = getAuthService();
    const profile = await authService.getProfile(authUser.userId);

    return apiSuccess(profile, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
