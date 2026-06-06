import { FastifyInstance } from "fastify";
import usersModule from "../modules/users/user.module";
import authModule from "../modules/auth/auth.module";
import plantsModule from "../modules/plants/plants.module";
import sensorReadingsModule from "../modules/sensor_readings/sensor_readings.module";
import syncModule from "../modules/sync/sync.module";

export default async function Routes(fastify: FastifyInstance) {
  await usersModule(fastify);
  await authModule(fastify);
  await plantsModule(fastify);
  await sensorReadingsModule(fastify);
  await syncModule(fastify);
}
