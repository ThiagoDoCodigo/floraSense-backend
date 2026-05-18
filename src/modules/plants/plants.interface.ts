import { Plant } from "./models/plant.model";
import {
  CreatePlantDTO,
  UpdatePlantDTO,
  ListPlantsParams,
  PlantResponseDTO,
  PaginatedResponse,
  ConnectDeviceDTO,
  DashboardIndicatorsDTO,
} from "./plants.types";

export interface IPlantsService {
  create(userId: string, data: CreatePlantDTO): Promise<Plant>;
  update(id: string, data: UpdatePlantDTO): Promise<[number, Plant[]]>;
  findById(id: string): Promise<Plant | null>;
  findAllPaginated(
    params: ListPlantsParams,
  ): Promise<{ rows: Plant[]; count: number }>;
  delete(id: string): Promise<number>;
  getDashboardIndicators(userId: string): Promise<DashboardIndicatorsDTO>;
}

export interface IPlantsBusiness {
  createPlant(userId: string, data: CreatePlantDTO): Promise<PlantResponseDTO>;
  updatePlant(
    userId: string,
    userRole: string,
    plantId: string,
    data: UpdatePlantDTO,
  ): Promise<PlantResponseDTO>;
  getPlantById(
    userId: string,
    userRole: string,
    plantId: string,
  ): Promise<PlantResponseDTO>;
  getPlantsPaginated(
    userId: string,
    userRole: string,
    params: ListPlantsParams,
  ): Promise<PaginatedResponse<PlantResponseDTO>>;
  deletePlant(userId: string, userRole: string, plantId: string): Promise<void>;
  connectDevice(
    userId: string,
    userRole: string,
    plantId: string,
    data: ConnectDeviceDTO,
  ): Promise<PlantResponseDTO>;
  disconnectDevice(
    userId: string,
    userRole: string,
    plantId: string,
  ): Promise<PlantResponseDTO>;
  getUserIndicators(userId: string): Promise<DashboardIndicatorsDTO>;
}
