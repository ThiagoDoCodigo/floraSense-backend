import { Sequelize, Op } from "sequelize";
import { Plant } from "./models/plant.model";
import { User } from "../users/models/user.model";
import {
  CreatePlantDTO,
  UpdatePlantDTO,
  ListPlantsParams,
  DashboardIndicatorsDTO,
} from "./plants.types";
import { IPlantsService } from "./plants.interface";
import { SensorReading } from "../sensor_readings/models/sensor_reading.model";

export class PlantsService implements IPlantsService {
  public async create(userId: string, data: CreatePlantDTO): Promise<Plant> {
    return await Plant.create({ ...data, userId });
  }

  public async findById(id: string): Promise<Plant | null> {
    return await Plant.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email"],
        },
      ],
    });
  }

  public async update(
    id: string,
    data: UpdatePlantDTO,
  ): Promise<[number, Plant[]]> {
    return await Plant.update(data, {
      where: { id },
      returning: true,
    });
  }

  public async findAllPaginated(params: ListPlantsParams) {
    const offset = (params.page - 1) * params.limit;
    const where: Record<string, unknown> = {};

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.name) {
      where.name = { [Op.iLike]: `%${params.name}%` };
    }

    if (params.especie) {
      where.especie = { [Op.iLike]: `%${params.especie}%` };
    }

    if (params.phaseOfLife) {
      where.phaseOfLife = params.phaseOfLife;
    }

    return await Plant.findAndCountAll({
      where,
      limit: params.limit,
      offset,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email"],
        },
      ],
    });
  }

  public async delete(id: string): Promise<number> {
    return await Plant.destroy({ where: { id } });
  }

  public async getDashboardIndicators(
    userId: string,
  ): Promise<DashboardIndicatorsDTO> {
    const totalPlants = await Plant.count({ where: { userId } });

    const plantsInAttention = await SensorReading.count({
      where: { isUrgent: true, isRead: false },
      include: [
        {
          model: Plant,
          as: "plant",
          where: { userId },
          attributes: [],
        },
      ],
    });

    const averages = (await SensorReading.findOne({
      attributes: [
        [Sequelize.fn("AVG", Sequelize.col("soilMoisture")), "avgMoisture"],
        [Sequelize.fn("AVG", Sequelize.col("temperature")), "avgTemp"],
      ],
      include: [
        {
          model: Plant,
          as: "plant",
          where: { userId },
          attributes: [],
        },
      ],
      raw: true,
    })) as any;

    return {
      totalPlants,
      plantsInAttention,
      averageSoilMoisture: averages?.avgMoisture
        ? Number(parseFloat(averages.avgMoisture).toFixed(1))
        : 0,
      averageTemperature: averages?.avgTemp
        ? Number(parseFloat(averages.avgTemp).toFixed(1))
        : 0,
    };
  }
}
