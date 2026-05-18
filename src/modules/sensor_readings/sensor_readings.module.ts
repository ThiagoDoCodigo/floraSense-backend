import { FastifyInstance } from "fastify";
import { sensorReadingsRoutes } from "./sensor_readings.routes";

export default async function sensorReadingsModule(fastify: FastifyInstance) {
  fastify.register(sensorReadingsRoutes, { prefix: "/api/v1/sensor-readings" });
}
