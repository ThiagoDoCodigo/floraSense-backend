import { FastifyRequest, FastifyReply } from "fastify";
import { PlantsBusiness } from "./plants.business";
import { sendError } from "../../utils/errors/sendError";
import { CustomError } from "../../utils/errors/CustomError";
import {
  CreatePlantDTO,
  UpdatePlantDTO,
  ListPlantsParams,
  ConnectDeviceDTO,
} from "./plants.types";

const streamToBuffer = async (stream: any): Promise<Buffer> => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

export class PlantsController {
  private readonly plantsBusiness: PlantsBusiness;

  constructor(plantsBusiness: PlantsBusiness) {
    this.plantsBusiness = plantsBusiness;
  }

  private getAuthData(request: FastifyRequest) {
    const userId = request.authUser?.id_user;
    const userRole = request.authUser?.role;

    if (!userId || !userRole) {
      throw new CustomError(
        "Não foi possível identificar o usuário autenticado.",
        401,
      );
    }

    return { userId, userRole };
  }

  public async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = this.getAuthData(request);
      const parts = request.parts();
      let fileMeta: any = undefined;
      const bodyData: any = {};

      for await (const part of parts) {
        if (part.type === "file") {
          const buffer = await streamToBuffer(part.file);
          if (buffer.length > 0) {
            fileMeta = {
              buffer,
              mimetype: part.mimetype,
              filename: part.filename,
            };
          }
        } else {
          bodyData[part.fieldname] = part.value;
        }
      }

      const result = await this.plantsBusiness.createPlant(
        userId,
        bodyData as CreatePlantDTO,
        fileMeta,
      );
      return reply.code(201).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId, userRole } = this.getAuthData(request);
      const parts = request.parts();
      let fileMeta: any = undefined;
      const bodyData: any = {};

      for await (const part of parts) {
        if (part.type === "file") {
          const buffer = await streamToBuffer(part.file);
          if (buffer.length > 0) {
            fileMeta = {
              buffer,
              mimetype: part.mimetype,
              filename: part.filename,
            };
          }
        } else {
          bodyData[part.fieldname] = part.value;
        }
      }

      const result = await this.plantsBusiness.updatePlant(
        userId,
        userRole,
        request.params.id,
        bodyData as UpdatePlantDTO,
        fileMeta,
      );
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId, userRole } = this.getAuthData(request);
      const result = await this.plantsBusiness.getPlantById(
        userId,
        userRole,
        request.params.id,
      );
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async list(
    request: FastifyRequest<{ Querystring: ListPlantsParams }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId, userRole } = this.getAuthData(request);
      const result = await this.plantsBusiness.getPlantsPaginated(
        userId,
        userRole,
        request.query,
      );
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId, userRole } = this.getAuthData(request);
      await this.plantsBusiness.deletePlant(
        userId,
        userRole,
        request.params.id,
      );
      return reply.code(204).send();
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async connect(
    request: FastifyRequest<{ Body: ConnectDeviceDTO; Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId, userRole } = this.getAuthData(request);
      const result = await this.plantsBusiness.connectDevice(
        userId,
        userRole,
        request.params.id,
        request.body,
      );
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async disconnect(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId, userRole } = this.getAuthData(request);
      const result = await this.plantsBusiness.disconnectDevice(
        userId,
        userRole,
        request.params.id,
      );
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async getIndicators(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = this.getAuthData(request);
      const result = await this.plantsBusiness.getUserIndicators(userId);
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async updateInterval(
    request: FastifyRequest<{
      Params: { id: string };
      Body: import("./plants.types").UpdateIntervalDTO;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId, userRole } = this.getAuthData(request);
      const result = await this.plantsBusiness.updateDeviceInterval(
        userId,
        userRole,
        request.params.id,
        request.body.intervalMinutes,
      );
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async forceReading(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId, userRole } = this.getAuthData(request);
      const result = await this.plantsBusiness.forceDeviceReading(
        userId,
        userRole,
        request.params.id,
      );
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }
}
