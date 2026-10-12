import { getPeopleService } from "../../../server/people/services";
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
    const peopleService = getPeopleService();
    const person = await peopleService.getPerson(id, authUser.userId);

    return apiSuccess(person, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, contextOrParams?: RouteContext): Promise<Response> {
  try {
    const authUser = requireAuth(request);
    const id = extractId(request, contextOrParams);
    const body = await request.json();
    const peopleService = getPeopleService();
    const updated = await peopleService.updatePerson(id, authUser.userId, body);

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
    const peopleService = getPeopleService();
    await peopleService.deletePerson(id, authUser.userId);

    return apiSuccess({ message: "Pessoa removida com sucesso" }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
