import { PlantsService } from "./plants.service";
import { IPlantsBusiness } from "./plants.interface";
import {
  CreatePlantDTO,
  UpdatePlantDTO,
  PlantResponseDTO,
  ListPlantsParams,
  PaginatedResponse,
  ConnectDeviceDTO,
  DashboardIndicatorsDTO,
} from "./plants.types";
import { Plant } from "./models/plant.model";
import { handleSequelizeError } from "../../utils/errors/handleSequelizeError";
import { CustomError } from "../../utils/errors/CustomError";
import { UserRole } from "../users/user.types";
import { plantSocketManager } from "./plants.sockets";

export class PlantsBusiness implements IPlantsBusiness {
  private readonly plantsService: PlantsService;

  constructor(plantsService: PlantsService) {
    this.plantsService = plantsService;
  }

  private formatResponse(plant: any): PlantResponseDTO {
    return {
      id: plant.id,
      userId: plant.userId,
      name: plant.name,
      especie: plant.especie,
      phaseOfLife: plant.phaseOfLife,
      environmentType: plant.environmentType,
      sunlightExposure: plant.sunlightExposure,
      substrateType: plant.substrateType,
      plantingDate: plant.plantingDate,
      created_at: plant.created_at,
      updated_at: plant.updated_at,
      isConnected: plant.isConnected,
      macAddress: plant.macAddress,
      firmwareVersion: plant.firmwareVersion,
      lastConnectionDate: plant.lastConnectionDate,
      delayReading: plant.delayReading,
      user: plant.user
        ? {
            name: plant.user.name,
            email: plant.user.email,
          }
        : undefined,
    };
  }

  private checkOwnership(plant: Plant, userId: string, userRole: string): void {
    if (userRole !== UserRole.ADMIN && plant.userId !== userId) {
      throw new CustomError(
        "Você não tem permissão para acessar ou modificar esta planta.",
        403,
      );
    }
  }

  public async createPlant(
    userId: string,
    data: CreatePlantDTO,
  ): Promise<PlantResponseDTO> {
    try {
      const plant = await this.plantsService.create(userId, data);
      return this.formatResponse(plant);
    } catch (err) {
      handleSequelizeError(err, "Criação de Planta");
    }
  }

  public async updatePlant(
    userId: string,
    userRole: string,
    plantId: string,
    data: UpdatePlantDTO,
  ): Promise<PlantResponseDTO> {
    try {
      const plant = await this.plantsService.findById(plantId);

      if (!plant) {
        throw new CustomError("Planta não encontrada.", 404);
      }

      this.checkOwnership(plant, userId, userRole);

      const [affectedCount, [updatedPlant]] = await this.plantsService.update(
        plantId,
        data,
      );

      if (affectedCount === 0) {
        throw new CustomError("Falha ao atualizar a planta.", 500);
      }

      return this.formatResponse(updatedPlant);
    } catch (err) {
      handleSequelizeError(err, "Atualização de Planta");
    }
  }

  public async getPlantById(
    userId: string,
    userRole: string,
    plantId: string,
  ): Promise<PlantResponseDTO> {
    try {
      const plant = await this.plantsService.findById(plantId);

      if (!plant) {
        throw new CustomError("Planta não encontrada.", 404);
      }

      this.checkOwnership(plant, userId, userRole);

      return this.formatResponse(plant);
    } catch (err) {
      handleSequelizeError(err, "Busca de Planta por ID");
    }
  }

  public async getPlantsPaginated(
    userId: string,
    userRole: string,
    params: ListPlantsParams,
  ): Promise<PaginatedResponse<PlantResponseDTO>> {
    try {
      const filterParams = { ...params };

      if (userRole !== UserRole.ADMIN) {
        filterParams.userId = userId;
      }

      const { rows, count } =
        await this.plantsService.findAllPaginated(filterParams);
      const totalPages = Math.ceil(count / params.limit);

      return {
        data: rows.map((plant) => this.formatResponse(plant)),
        limit: params.limit,
        page: params.page,
        totalPages,
        total: count,
      };
    } catch (err) {
      handleSequelizeError(err, "Listagem de Plantas");
    }
  }

  public async deletePlant(
    userId: string,
    userRole: string,
    plantId: string,
  ): Promise<void> {
    try {
      const plant = await this.plantsService.findById(plantId);

      if (!plant) {
        throw new CustomError("Planta não encontrada.", 404);
      }

      this.checkOwnership(plant, userId, userRole);

      await this.plantsService.delete(plantId);
    } catch (err) {
      handleSequelizeError(err, "Exclusão de Planta");
    }
  }

  public async connectDevice(
    userId: string,
    userRole: string,
    plantId: string,
    data: ConnectDeviceDTO,
  ): Promise<PlantResponseDTO> {
    try {
      const plant = await this.plantsService.findById(plantId);

      if (!plant) throw new CustomError("Planta não encontrada.", 404);
      this.checkOwnership(plant, userId, userRole);

      const updateData = {
        isConnected: true,
        macAddress: data.macAddress,
        firmwareVersion: data.firmwareVersion || null,
        lastConnectionDate: new Date(),
      };

      const [affectedCount, [updatedPlant]] = await this.plantsService.update(
        plantId,
        updateData,
      );
      if (affectedCount === 0)
        throw new CustomError("Falha ao vincular o dispositivo.", 500);

      return this.formatResponse(updatedPlant);
    } catch (err) {
      handleSequelizeError(err, "Conexão de Dispositivo IoT");
    }
  }

  public async disconnectDevice(
    userId: string,
    userRole: string,
    plantId: string,
  ): Promise<PlantResponseDTO> {
    try {
      const plant = await this.plantsService.findById(plantId);
      if (!plant) throw new CustomError("Planta não encontrada.", 404);
      this.checkOwnership(plant, userId, userRole);

      plantSocketManager.sendCommand(plantId, { command: "disconnect" });
      plantSocketManager.removeSocket(plantId);

      const updateData = {
        isConnected: false,
        macAddress: null,
        firmwareVersion: null,
        lastConnectionDate: null,
      };
      const [affectedCount, [updatedPlant]] = await this.plantsService.update(
        plantId,
        updateData,
      );

      if (affectedCount === 0)
        throw new CustomError("Falha ao desvincular o dispositivo.", 500);
      return this.formatResponse(updatedPlant);
    } catch (err) {
      handleSequelizeError(err, "Desconexão de IoT");
    }
  }

  public async getUserIndicators(
    userId: string,
  ): Promise<DashboardIndicatorsDTO> {
    try {
      return await this.plantsService.getDashboardIndicators(userId);
    } catch (err) {
      handleSequelizeError(err, "Busca de Indicadores do Dashboard");
    }
  }

  public async updateDeviceInterval(
    userId: string,
    userRole: string,
    plantId: string,
    intervalMinutes: number,
  ) {
    try {
      const plant = await this.plantsService.findById(plantId);
      if (!plant) throw new CustomError("Planta não encontrada.", 404);
      this.checkOwnership(plant, userId, userRole);

      const isOnline = plantSocketManager.sendCommand(plantId, {
        readingIntervalMinutes: intervalMinutes,
      });
      if (!isOnline) throw new CustomError("O módulo está offline.", 503);

      await this.plantsService.update(plantId, {
        delayReading: intervalMinutes,
      });

      return { message: "Ciclo atualizado no microcontrolador." };
    } catch (err) {
      handleSequelizeError(err, "Atualização de Delay");
    }
  }

  public async forceDeviceReading(
    userId: string,
    userRole: string,
    plantId: string,
  ) {
    try {
      const plant = await this.plantsService.findById(plantId);
      if (!plant) throw new CustomError("Planta não encontrada.", 404);
      this.checkOwnership(plant, userId, userRole);

      const isOnline = plantSocketManager.sendCommand(plantId, {
        command: "force_reading",
      });
      if (!isOnline)
        throw new CustomError(
          "Módulo offline. Verifique a conexão Wi-Fi do hardware.",
          503,
        );

      return { message: "Comando enviado. A leitura chegará em instantes." };
    } catch (err) {
      handleSequelizeError(err, "Forçar Leitura");
    }
  }
}
