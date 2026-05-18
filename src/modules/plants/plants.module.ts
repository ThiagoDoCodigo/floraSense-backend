import { FastifyInstance } from "fastify";
import { plantsRoutes } from "./plants.routes";

export default async function plantsModule(fastify: FastifyInstance) {
  fastify.register(plantsRoutes, { prefix: "/api/v1/plants" });
}
