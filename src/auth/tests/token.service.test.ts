import { tokenService } from "../services/token.service";
import * as SecureStore from "expo-secure-store";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe("tokenService (TDD)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should save token to secure storage", async () => {
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

    await tokenService.saveToken("sample-token-123");

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "finances_auth_token",
      "sample-token-123",
    );
  });

  it("should retrieve token from secure storage", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("retrieved-token-xyz");

    const token = await tokenService.getToken();

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("finances_auth_token");
    expect(token).toBe("retrieved-token-xyz");
  });

  it("should remove token from secure storage", async () => {
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    await tokenService.removeToken();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("finances_auth_token");
  });
});
