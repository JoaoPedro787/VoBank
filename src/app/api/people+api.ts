import { getPeopleService } from "../../server/people/services";
import { requireAuth } from "../../server/auth/middleware/auth.middleware";
import { apiSuccess, handleApiError } from "../../server/shared/utils/api-response";

export async function GET(request: Request): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const peopleService = getPeopleService();
    const people = await peopleService.listPeople(authUser.userId);

    return apiSuccess(people, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const body = await request.json();
    const peopleService = getPeopleService();
    const created = await peopleService.createPerson(authUser.userId, body);

    return apiSuccess(created, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
