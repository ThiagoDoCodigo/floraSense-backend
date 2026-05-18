import { SensorReading } from "./models/sensor_reading.model";
import { Plant } from "../plants/models/plant.model";
import {
  CreateSensorReadingDTO,
  ListSensorReadingsParams,
  ListUrgentReadingsParams,
  SensorReadingResponseDTO,
  PaginatedResponse,
  LevelUrgentEnum,
} from "./sensor_readings.types";

export interface ISensorReadingsService {
  findPlantById(plantId: string): Promise<Plant | null>;

  create(
    data: CreateSensorReadingDTO,
    aiDiagnosis: string,
    actionRecommended: string,
    isUrgent: boolean,
    levelUrgent: LevelUrgentEnum | null,
    parametersIdeas: string | null,
  ): Promise<SensorReading>;

  findAllByPlantPaginated(
    plantId: string,
    params: ListSensorReadingsParams,
  ): Promise<{ rows: SensorReading[]; count: number }>;

  findById(id: string): Promise<SensorReading | null>;
  markAsRead(id: string): Promise<void>;
  findUrgentUnreadPaginated(
    userId: string,
    params: ListUrgentReadingsParams,
  ): Promise<{ rows: SensorReading[]; count: number }>;
}

export interface ISensorReadingsBusiness {
  processNewReading(
    data: CreateSensorReadingDTO,
  ): Promise<SensorReadingResponseDTO>;

  getReadingsByPlant(
    userId: string,
    userRole: string,
    plantId: string,
    params: ListSensorReadingsParams,
  ): Promise<PaginatedResponse<SensorReadingResponseDTO>>;

  getUrgentReadings(
    userId: string,
    params: ListUrgentReadingsParams,
  ): Promise<PaginatedResponse<SensorReadingResponseDTO>>;

  markReadingAsRead(
    userId: string,
    userRole: string,
    readingId: string,
  ): Promise<void>;
}
