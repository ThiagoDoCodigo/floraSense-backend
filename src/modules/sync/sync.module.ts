import { FastifyInstance } from "fastify";
import { syncRoutes } from "./sync.routes";

export default async function syncModule(fastify: FastifyInstance) {
  fastify.register(syncRoutes, { prefix: "/api/v1/sync" });
}
