import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes";

export default async function authModule(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: "/api/v1/auth" });
}
