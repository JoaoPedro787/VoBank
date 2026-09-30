import { IAuthRepository } from "../repositories/auth.repository.interface";
import {
  RegisterUserInput,
  LoginUserInput,
  UserResponse,
  registerUserSchema,
  loginUserSchema,
} from "../schemas/auth.schema";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";
import { ConflictError, UnauthorizedError, NotFoundError } from "../../shared/errors/app-error";

export interface AuthResult {
  user: UserResponse;
  token: string;
}

export class AuthService {
  constructor(private authRepo: IAuthRepository) {}

  async register(input: RegisterUserInput): Promise<AuthResult> {
    const validated = registerUserSchema.parse(input);

    const existingUser = await this.authRepo.findByEmail(validated.email);
    if (existingUser) {
      throw new ConflictError("E-mail já está em uso");
    }

    const hashedPassword = await hashPassword(validated.password);

    const created = await this.authRepo.create({
      name: validated.name,
      email: validated.email,
      password: hashedPassword,
    });

    const user: UserResponse = {
      id: created.id,
      name: created.name,
      email: created.email,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };

    const token = signToken({ userId: user.id, email: user.email });

    return { user, token };
  }

  async login(input: LoginUserInput): Promise<AuthResult> {
    const validated = loginUserSchema.parse(input);

    const existingUser = await this.authRepo.findByEmail(validated.email);
    if (!existingUser) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const isPasswordValid = await comparePassword(validated.password, existingUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const user: UserResponse = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      createdAt: existingUser.createdAt,
      updatedAt: existingUser.updatedAt,
    };

    const token = signToken({ userId: user.id, email: user.email });

    return { user, token };
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
