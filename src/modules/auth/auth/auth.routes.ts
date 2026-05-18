import { FastifyInstance } from "fastify";
import { authController } from "./auth.container";
import { loginSchema, refreshTokenSchema } from "./auth.schema";
import { LoginRequestDTO, RefreshTokenRequestDTO } from "./auth.types";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: LoginRequestDTO }>(
    "/login",
    {
      schema: loginSchema,
    },
    authController.login.bind(authController),
  );

  fastify.post<{ Body: RefreshTokenRequestDTO }>(
    "/refresh",
    {
      schema: refreshTokenSchema,
    },
    authController.refreshToken.bind(authController),
  );
}
