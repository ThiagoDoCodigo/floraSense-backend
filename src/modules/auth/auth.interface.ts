import { FastifyInstance } from "fastify";
import { User } from "../users/models/user.model";
import {
  AuthResponseDTO,
  LoginRequestDTO,
  RefreshTokenRequestDTO,
} from "./auth.types";

export interface IAuthService {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
}

export interface IAuthBusiness {
  login(
    fastify: FastifyInstance,
    data: LoginRequestDTO,
  ): Promise<AuthResponseDTO>;
  refreshToken(
    fastify: FastifyInstance,
    data: RefreshTokenRequestDTO,
  ): Promise<AuthResponseDTO>;
}
