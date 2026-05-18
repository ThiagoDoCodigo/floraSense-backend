import { SensorReadingsService } from "./sensor_readings.service";
import { GeminiService } from "../../services/ai/gemini.service";
import { ISensorReadingsBusiness } from "./sensor_readings.interface";
import {
  CreateSensorReadingDTO,
  ListSensorReadingsParams,
  ListUrgentReadingsParams,
  PaginatedResponse,
  SensorReadingResponseDTO,
} from "./sensor_readings.types";
import { SensorReading } from "./models/sensor_reading.model";
import { handleSequelizeError } from "../../utils/errors/handleSequelizeError";
import { CustomError } from "../../utils/errors/CustomError";
import { UserRole } from "../users/user.types";
import { appEvents } from "../../utils/events/appEventEmitter";

export class SensorReadingsBusiness implements ISensorReadingsBusiness {
  private readonly readingsService: SensorReadingsService;
  private readonly geminiService: GeminiService;

  constructor(
    readingsService: SensorReadingsService,
    geminiService: GeminiService,
  ) {
    this.readingsService = readingsService;
    this.geminiService = geminiService;
  }

  private formatResponse(reading: SensorReading): SensorReadingResponseDTO {
    return {
      id: reading.id,
      plantId: reading.plantId,
      soilMoisture: reading.soilMoisture,
      temperature: reading.temperature,
      airHumidity: reading.airHumidity,
      nitrogen: reading.nitrogen,
      phosphorus: reading.phosphorus,
      potassium: reading.potassium,
      aiDiagnosis: reading.aiDiagnosis,
      actionRecommended: reading.actionRecommended,
      isUrgent: reading.isUrgent,
      isRead: reading.isRead,
      parametersIdeas: reading.parametersIdeas,
      levelUrgent: reading.levelUrgent,
      created_at: reading.created_at,
    };
  }

  public async processNewReading(
    data: CreateSensorReadingDTO,
  ): Promise<SensorReadingResponseDTO> {
    try {
      const plant = await this.readingsService.findPlantById(data.plantId);

      if (!plant) {
        throw new CustomError("Planta não encontrada.", 404);
      }

      if (!plant.isConnected) {
        throw new CustomError(
          "Ação negada: Esta planta não possui um dispositivo IoT conectado no momento.",
          403,
        );
      }

      if (!plant.macAddress) {
        throw new CustomError(
          "Acesso negado: O dispositivo vinculado a esta planta ainda não foi configurado.",
          403,
        );
      }

      if (plant.macAddress !== data.macAddress) {
        throw new CustomError(
          "Acesso negado: O Endereço MAC enviado não corresponde ao dispositivo vinculado a esta planta.",
          403,
        );
      }

      if (plant.userId !== data.userId) {
        throw new CustomError(
          "Acesso negado: Credenciais inválidas para o dispositivo desta planta.",
          403,
        );
      }

      const aiResult = await this.geminiService.generatePlantDiagnosis(
        {
          name: plant.name,
          especie: plant.especie,
          phaseOfLife: plant.phaseOfLife,
          environmentType: plant.environmentType,
          sunlightExposure: plant.sunlightExposure,
          substrateType: plant.substrateType,
          plantingDate: plant.plantingDate,
        },
        {
          soilMoisture: data.soilMoisture,
          temperature: data.temperature,
          airHumidity: data.airHumidity,
          nitrogen: data.nitrogen,
          phosphorus: data.phosphorus,
          potassium: data.potassium,
        },
      );

      const newReading = await this.readingsService.create(
        data,
        aiResult.aiDiagnosis,
        aiResult.actionRecommended,
        aiResult.isUrgent,
        aiResult.levelUrgent,
        aiResult.parametersIdeas,
      );

      const response = this.formatResponse(newReading);

      appEvents.emit("reading:created", {
        reading: response,
        userId: plant.userId,
        plantId: plant.id,
      });

      return response;
    } catch (err) {
      handleSequelizeError(err, "Processamento de Leitura de Sensor");
    }
  }

  public async getReadingsByPlant(
    userId: string,
    userRole: string,
    plantId: string,
    params: ListSensorReadingsParams,
  ): Promise<PaginatedResponse<SensorReadingResponseDTO>> {
    try {
      const plant = await this.readingsService.findPlantById(plantId);

      if (!plant) {
        throw new CustomError("Planta não encontrada.", 404);
      }

      if (userRole !== UserRole.ADMIN && plant.userId !== userId) {
        throw new CustomError(
          "Você não tem permissão para acessar os dados desta planta.",
          403,
        );
      }

      const { rows, count } =
        await this.readingsService.findAllByPlantPaginated(plantId, params);
      const totalPages = Math.ceil(count / params.limit);

      return {
        data: rows.map((reading) => this.formatResponse(reading)),
        limit: params.limit,
        page: params.page,
        totalPages,
        total: count,
      };
    } catch (err) {
      handleSequelizeError(err, "Listagem de Leituras");
    }
  }

  public async getUrgentReadings(
    userId: string,
    params: ListUrgentReadingsParams,
  ): Promise<PaginatedResponse<SensorReadingResponseDTO>> {
    try {
      const { rows, count } =
        await this.readingsService.findUrgentUnreadPaginated(userId, params);
      const totalPages = Math.ceil(count / params.limit);

      return {
        data: rows.map((reading) => this.formatResponse(reading)),
        limit: params.limit,
        page: params.page,
        totalPages,
        total: count,
      };
    } catch (err) {
      handleSequelizeError(err, "Listagem de Alertas Urgentes");
    }
  }

  public async markReadingAsRead(
    userId: string,
    userRole: string,
    readingId: string,
  ): Promise<void> {
    try {
      const reading = await this.readingsService.findById(readingId);

      if (!reading) throw new CustomError("Leitura não encontrada.", 404);

      if (userRole !== UserRole.ADMIN && reading.plant?.userId !== userId) {
        throw new CustomError(
          "Você não tem permissão para modificar esta leitura.",
          403,
        );
      }

      await this.readingsService.markAsRead(readingId);
    } catch (err) {
      handleSequelizeError(err, "Marcação de Leitura");
    }
  }
}
