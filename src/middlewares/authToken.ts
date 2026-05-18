import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "../modules/users/user.types";

declare module "fastify" {
  interface FastifyRequest {
    authUser?: { id_user: string; role: UserRole };
    authType?: string;
  }

  interface FastifyInstance {
    verifyAuthToken: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

export function AuthToken(app: FastifyInstance) {
  app.decorate(
    "verifyAuthToken",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = request.headers.authorization
          ?.split("Bearer ")[1]
          ?.trim();
        if (!token)
          return reply.code(401).send({ error: "Token não fornecido" });

        const payload = await request.jwtVerify<{
          id_user: string;
          role: UserRole;
        }>();
        request.authUser = payload;
        request.authType = "jwt";

        request.log.info(
          `Autenticado como ${payload.id_user} (${payload.role})`,
        );
      } catch {
        request.log.warn("Falha na autenticação");
        return reply.code(401).send({ error: "Usuário não autenticado" });
      }
    },
  );
}
