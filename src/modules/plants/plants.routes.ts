import { FastifyInstance } from "fastify";
import fastifyWebSocket from "@fastify/websocket";
import { plantsController } from "./plants.container";
import {
  createPlantSchema,
  updatePlantSchema,
  listPlantsSchema,
  getOrDeletePlantSchema,
  connectDeviceSchema,
  getIndicatorsSchema,
  updateIntervalSchema,
  actionDeviceSchema,
} from "./plants.schema";
import { requireRole } from "../../middlewares/roleGuard";
import { UserRole } from "../users/user.types";
import {
  CreatePlantDTO,
  UpdatePlantDTO,
  ListPlantsParams,
  ConnectDeviceDTO,
} from "./plants.types";
import { plantSocketManager } from "./plants.sockets";

export async function plantsRoutes(fastify: FastifyInstance) {
  await fastify.register(fastifyWebSocket);

  fastify.get("/ws/device", { websocket: true }, (socket: any, req) => {
    const query = req.query as { plantId?: string };

    if (!query.plantId) {
      socket.close(4001, "Plant ID missing.");
      return;
    }

    plantSocketManager.registerSocket(query.plantId, socket);

    socket.on("close", () =>
      plantSocketManager.removeSocket(query.plantId as string),
    );

    socket.on("error", () =>
      plantSocketManager.removeSocket(query.plantId as string),
    );
  });

  fastify.register(async (protectedInstance) => {
    protectedInstance.addHook("preHandler", protectedInstance.verifyAuthToken);

    protectedInstance.post<{ Body: CreatePlantDTO }>(
      "/",
      {
        schema: createPlantSchema,
        preHandler: requireRole([UserRole.USER], "cadastrar novas plantas"),
      },
      plantsController.create.bind(plantsController),
    );

    protectedInstance.patch<{ Body: UpdatePlantDTO; Params: { id: string } }>(
      "/:id",
      {
        schema: updatePlantSchema,
        preHandler: requireRole([UserRole.USER], "atualizar dados de plantas"),
      },
      plantsController.update.bind(plantsController),
    );

    protectedInstance.get<{ Querystring: ListPlantsParams }>(
      "/",
      {
        schema: listPlantsSchema,
        preHandler: requireRole(
          [UserRole.ADMIN, UserRole.USER],
          "listar plantas",
        ),
      },
      plantsController.list.bind(plantsController),
    );

    protectedInstance.get<{ Params: { id: string } }>(
      "/:id",
      {
        schema: getOrDeletePlantSchema,
        preHandler: requireRole(
          [UserRole.ADMIN, UserRole.USER],
          "visualizar planta específica",
        ),
      },
      plantsController.getById.bind(plantsController),
    );

    protectedInstance.delete<{ Params: { id: string } }>(
      "/:id",
      {
        schema: getOrDeletePlantSchema,
        preHandler: requireRole(
          [UserRole.ADMIN, UserRole.USER],
          "excluir plantas",
        ),
      },
      plantsController.delete.bind(plantsController),
    );

    protectedInstance.post<{ Body: ConnectDeviceDTO; Params: { id: string } }>(
      "/:id/connect",
      {
        schema: connectDeviceSchema,
        preHandler: requireRole([UserRole.USER], "vincular dispositivo IoT"),
      },
      plantsController.connect.bind(plantsController),
    );

    protectedInstance.post<{ Params: { id: string } }>(
      "/:id/disconnect",
      {
        schema: getOrDeletePlantSchema,
        preHandler: requireRole([UserRole.USER], "desvincular dispositivo IoT"),
      },
      plantsController.disconnect.bind(plantsController),
    );

    protectedInstance.get(
      "/indicators/by-plants",
      {
        schema: getIndicatorsSchema,
        preHandler: requireRole([UserRole.USER], "visualizar indicadores"),
      },
      plantsController.getIndicators.bind(plantsController),
    );

    protectedInstance.patch<{
      Params: { id: string };
      Body: import("./plants.types").UpdateIntervalDTO;
    }>(
      "/:id/interval",
      {
        schema: updateIntervalSchema,
        preHandler: requireRole([UserRole.USER], "ajustar delay"),
      },
      plantsController.updateInterval.bind(plantsController),
    );

    protectedInstance.post<{ Params: { id: string } }>(
      "/:id/force-reading",
      {
        schema: actionDeviceSchema,
        preHandler: requireRole([UserRole.USER], "forçar leitura"),
      },
      plantsController.forceReading.bind(plantsController),
    );
  });
}
