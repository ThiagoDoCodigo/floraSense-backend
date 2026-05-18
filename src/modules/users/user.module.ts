import { FastifyInstance } from "fastify";
import { usersRoutes } from "./user.routes";

export default async function usersModule(fastify: FastifyInstance) {
  fastify.register(usersRoutes, { prefix: "/api/v1/users" });
}
