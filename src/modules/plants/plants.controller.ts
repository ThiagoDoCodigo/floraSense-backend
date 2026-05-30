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

  public async create(
    request: FastifyRequest<{ Body: CreatePlantDTO }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId } = this.getAuthData(request);
      const result = await this.plantsBusiness.createPlant(
        userId,
        request.body,
      );
      return reply.code(201).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async update(
    request: FastifyRequest<{ Body: UpdatePlantDTO; Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId, userRole } = this.getAuthData(request);
      const result = await this.plantsBusiness.updatePlant(
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
