import { FastifyRequest, FastifyReply } from "fastify";
import { SensorReadingsBusiness } from "./sensor_readings.business";
import { sendError } from "../../utils/errors/sendError";
import { CustomError } from "../../utils/errors/CustomError";
import {
  CreateSensorReadingDTO,
  ListSensorReadingsParams,
  ListUrgentReadingsParams,
} from "./sensor_readings.types";

export class SensorReadingsController {
  private readonly readingsBusiness: SensorReadingsBusiness;

  constructor(readingsBusiness: SensorReadingsBusiness) {
    this.readingsBusiness = readingsBusiness;
  }

  public async processReading(
    request: FastifyRequest<{ Body: CreateSensorReadingDTO }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.readingsBusiness.processNewReading(
        request.body,
      );
      return reply.code(201).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async listByPlant(
    request: FastifyRequest<{
      Params: { plantId: string };
      Querystring: ListSensorReadingsParams;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.authUser?.id_user;
      const userRole = request.authUser?.role;

      if (!userId || !userRole) {
        throw new CustomError(
          "Não foi possível identificar o usuário autenticado.",
          401,
        );
      }

      const result = await this.readingsBusiness.getReadingsByPlant(
        userId,
        userRole,
        request.params.plantId,
        request.query,
      );
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async listUrgent(
    request: FastifyRequest<{ Querystring: ListUrgentReadingsParams }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.authUser?.id_user;
      if (!userId) throw new CustomError("Usuário não autenticado.", 401);

      const result = await this.readingsBusiness.getUrgentReadings(
        userId,
        request.query,
      );
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async markAsRead(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.authUser?.id_user;
      const userRole = request.authUser?.role;
      if (!userId || !userRole)
        throw new CustomError("Usuário não autenticado.", 401);

      await this.readingsBusiness.markReadingAsRead(
        userId,
        userRole,
        request.params.id,
      );
      return reply.code(204).send();
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }
}
