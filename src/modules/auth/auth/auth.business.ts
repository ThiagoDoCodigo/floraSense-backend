import bcrypt from "bcrypt";
import { FastifyInstance } from "fastify";
import { AuthService } from "./auth.service";
import { IAuthBusiness } from "./auth.interface";
import {
  AuthResponseDTO,
  LoginRequestDTO,
  RefreshTokenRequestDTO,
} from "./auth.types";
import { User } from "../users/models/user.model";
import { CustomError } from "../../utils/errors/CustomError";
import { handleSequelizeError } from "../../utils/errors/handleSequelizeError";

export class AuthBusiness implements IAuthBusiness {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  private async generateTokens(fastify: FastifyInstance, user: User) {
    const payload = {
      id_user: user.id,
      role: user.role,
    };

    const accessToken = fastify.jwt.sign(payload, { expiresIn: "10h" });
    const refreshToken = fastify.jwt.sign(payload, { expiresIn: "7d" });

    return { accessToken, refreshToken };
  }

  public async login(
    fastify: FastifyInstance,
    data: LoginRequestDTO,
  ): Promise<AuthResponseDTO> {
    try {
      const user = await this.authService.findUserByEmail(data.email);

      if (!user) {
        throw new CustomError("Usuário não encontrado.", 404);
      }

      const passwordMatch = await bcrypt.compare(data.password, user.password);

      if (!passwordMatch) {
        throw new CustomError("Senha incorreta.", 401);
      }

      const tokens = await this.generateTokens(fastify, user);

      return {
        tokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (err: unknown) {
      if (err instanceof CustomError) {
        throw err;
      }
      handleSequelizeError(err, "Login");
    }
  }

  public async refreshToken(
    fastify: FastifyInstance,
    data: RefreshTokenRequestDTO,
  ): Promise<AuthResponseDTO> {
    try {
      const decodedToken = fastify.jwt.verify<{
        id_user: string;
        role: string;
      }>(data.refreshToken);

      if (!decodedToken || !decodedToken.id_user) {
        throw new CustomError("Token inválido ou expirado.", 401);
      }

      const user = await this.authService.findUserById(decodedToken.id_user);

      if (!user) {
        throw new CustomError(
          "Usuário vinculado ao token não encontrado.",
          404,
        );
      }

      const tokens = await this.generateTokens(fastify, user);

      return {
        tokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (err: unknown) {
      if (err instanceof CustomError) {
        throw err;
      }
      throw new CustomError("Token inválido ou expirado.", 401);
    }
  }
}
