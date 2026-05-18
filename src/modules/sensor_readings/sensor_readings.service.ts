import { SensorReading } from "./models/sensor_reading.model";
import { Plant } from "../plants/models/plant.model";
import {
  CreateSensorReadingDTO,
  LevelUrgentEnum,
  ListSensorReadingsParams,
  ListUrgentReadingsParams,
} from "./sensor_readings.types";
import { ISensorReadingsService } from "./sensor_readings.interface";

export class SensorReadingsService implements ISensorReadingsService {
  public async findPlantById(plantId: string): Promise<Plant | null> {
    return await Plant.findByPk(plantId);
  }

  public async create(
    data: CreateSensorReadingDTO,
    aiDiagnosis: string,
    actionRecommended: string,
    isUrgent: boolean,
    levelUrgent: LevelUrgentEnum | null,
    parametersIdeas: string | null,
  ): Promise<SensorReading> {
    const { userId, macAddress, ...readingData } = data;
    return await SensorReading.create({
      ...readingData,
      aiDiagnosis,
      actionRecommended,
      isUrgent,
      levelUrgent,
      parametersIdeas,
    });
  }

  public async findAllByPlantPaginated(
    plantId: string,
    params: ListSensorReadingsParams,
  ) {
    const offset = (params.page - 1) * params.limit;

    return await SensorReading.findAndCountAll({
      where: { plantId },
      limit: params.limit,
      offset,
      order: [["created_at", "DESC"]],
    });
  }

  public async findById(id: string): Promise<SensorReading | null> {
    return await SensorReading.findByPk(id, {
      include: [{ model: Plant, as: "plant" }],
    });
  }

  public async markAsRead(id: string): Promise<void> {
    await SensorReading.update({ isRead: true }, { where: { id } });
  }

  public async findUrgentUnreadPaginated(
    userId: string,
    params: ListUrgentReadingsParams,
  ) {
    const offset = (params.page - 1) * params.limit;
    const where: any = { isUrgent: true, isRead: false };

    if (params.plantId) where.plantId = params.plantId;
    if (params.levelUrgent) where.levelUrgent = params.levelUrgent;

    return await SensorReading.findAndCountAll({
      where,
      limit: params.limit,
      offset,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Plant,
          as: "plant",
          where: { userId },
          attributes: ["id", "name"],
        },
      ],
    });
  }
}
