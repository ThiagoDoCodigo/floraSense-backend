import { FastifyInstance } from "fastify";
import { readingsController } from "./sensor_readings.container";
import {
  createReadingSchema,
  listReadingsSchema,
  listUrgentReadingsSchema,
  markAsReadSchema,
} from "./sensor_readings.schema";
import { requireRole } from "../../middlewares/roleGuard";
import { UserRole } from "../users/user.types";
import {
  CreateSensorReadingDTO,
  ListSensorReadingsParams,
  ListUrgentReadingsParams,
} from "./sensor_readings.types";

export async function sensorReadingsRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: CreateSensorReadingDTO }>(
    "/",
    { schema: createReadingSchema },
    readingsController.processReading.bind(readingsController),
  );

  fastify.register(async (protectedInstance: FastifyInstance) => {
    protectedInstance.addHook("preHandler", protectedInstance.verifyAuthToken);

    protectedInstance.get<{
      Params: { plantId: string };
      Querystring: ListSensorReadingsParams;
    }>(
      "/plant/:plantId",
      {
        schema: listReadingsSchema,
        preHandler: requireRole(
          [UserRole.ADMIN, UserRole.USER],
          "visualizar leituras dos sensores",
        ),
      },
      readingsController.listByPlant.bind(readingsController),
    );

    protectedInstance.get<{ Querystring: ListUrgentReadingsParams }>(
      "/urgent",
      {
        schema: listUrgentReadingsSchema,
        preHandler: requireRole(
          [UserRole.ADMIN, UserRole.USER],
          "visualizar alertas urgentes",
        ),
      },
      readingsController.listUrgent.bind(readingsController),
    );

    protectedInstance.patch<{ Params: { id: string } }>(
      "/:id/read",
      {
        schema: markAsReadSchema,
        preHandler: requireRole(
          [UserRole.ADMIN, UserRole.USER],
          "marcar alerta como lido",
        ),
      },
      readingsController.markAsRead.bind(readingsController),
    );
  });
}
