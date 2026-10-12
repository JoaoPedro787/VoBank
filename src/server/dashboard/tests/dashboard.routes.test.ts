import { DashboardService } from "../services/dashboard.service";
import { InMemoryDashboardRepository } from "../repositories/in-memory-dashboard.repository";
import { InMemoryPeopleRepository } from "../../people/repositories/in-memory-people.repository";
import { requireAuth } from "../../auth/middleware/auth.middleware";
import { apiSuccess, handleApiError } from "../../shared/utils/api-response";
import { signToken } from "../../auth/utils/jwt";

describe("Dashboard Route Handlers (Isolated In-Memory TDD)", () => {
  let dashboardRepo: InMemoryDashboardRepository;
  let peopleRepo: InMemoryPeopleRepository;
  let dashboardService: DashboardService;
  const userId = "11111111-1111-4111-a111-111111111111";
  let token: string;

  const handleGetDashboard = async (req: Request): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const url = new URL(req.url);
      const monthParam = url.searchParams.get("month");
      const yearParam = url.searchParams.get("year");
      const refDateParam = url.searchParams.get("referenceDate");

      const result = await dashboardService.getMonthlySummary(authUser.userId, {
        month: monthParam ? parseInt(monthParam, 10) : undefined,
        year: yearParam ? parseInt(yearParam, 10) : undefined,
        referenceDate: refDateParam || undefined,
      });

      return apiSuccess(result, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  beforeEach(() => {
    dashboardRepo = new InMemoryDashboardRepository();
    peopleRepo = new InMemoryPeopleRepository();
    dashboardService = new DashboardService(dashboardRepo, peopleRepo);

    token = signToken({
      userId,
      email: "test@example.com",
    });
  });

  it("should return 200 with dashboard summary for authenticated user", async () => {
    const req = new Request("http://localhost:8081/api/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await handleGetDashboard(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("totalCommitted");
    expect(data).toHaveProperty("totalPaid");
    expect(data).toHaveProperty("totalPending");
    expect(data).toHaveProperty("totalOverdue");
    expect(data).toHaveProperty("byPerson");
    expect(Array.isArray(data.byPerson)).toBe(true);
  });

  it("should filter by month and year query parameters", async () => {
    const req = new Request("http://localhost:8081/api/dashboard?month=11&year=2026", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await handleGetDashboard(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.month).toBe(11);
    expect(data.year).toBe(2026);
  });

  it("should return 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost:8081/api/dashboard", {
      method: "GET",
    });

    const res = await handleGetDashboard(req);
    expect(res.status).toBe(401);
  });

  it("should return 401 when JWT token is invalid", async () => {
    const req = new Request("http://localhost:8081/api/dashboard", {
      method: "GET",
      headers: {
        Authorization: "Bearer invalid.jwt.token",
      },
    });

    const res = await handleGetDashboard(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 when month parameter is invalid", async () => {
    const req = new Request("http://localhost:8081/api/dashboard?month=13", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await handleGetDashboard(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});
