import { FastifyInstance } from "fastify";
import { plantsController } from "./plants.container";
import {
  createPlantSchema,
  updatePlantSchema,
  listPlantsSchema,
  getOrDeletePlantSchema,
  connectDeviceSchema,
  getIndicatorsSchema,
} from "./plants.schema";
import { requireRole } from "../../middlewares/roleGuard";
import { UserRole } from "../users/user.types";
import {
  CreatePlantDTO,
  UpdatePlantDTO,
  ListPlantsParams,
  ConnectDeviceDTO,
} from "./plants.types";

export async function plantsRoutes(fastify: FastifyInstance) {
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
  });
}
