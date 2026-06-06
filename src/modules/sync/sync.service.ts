import { Op } from "sequelize";
import { Plant } from "../plants/models/plant.model";
import { SensorReading } from "../sensor_readings/models/sensor_reading.model";
import { SyncDeltaParams, SyncDeltaResponseDTO } from "./sync.types";

export class SyncService {
  public async getDelta(
    userId: string,
    params: SyncDeltaParams,
  ): Promise<SyncDeltaResponseDTO> {
    const { lastSync } = params;

    const plantWhere: any = { userId };
    const readingWhere: any = {};

    if (lastSync) {
      plantWhere.updated_at = { [Op.gt]: new Date(lastSync) };
      readingWhere.updated_at = { [Op.gt]: new Date(lastSync) };
    }

    const plants = await Plant.findAll({
      where: plantWhere,
      paranoid: false,
    });

    const deletedPlantIds = plants
      .filter((p) => p.deleted_at !== null)
      .map((p) => p.id);
    const updatedPlants = plants.filter((p) => p.deleted_at === null);

    const activeUserPlants = await Plant.findAll({
      where: { userId },
      attributes: ["id"],
    });
    const plantIds = activeUserPlants.map((p) => p.id);

    readingWhere.plantId = { [Op.in]: plantIds };

    const readings = await SensorReading.findAll({
      where: readingWhere,
      include: [
        {
          model: Plant,
          as: "plant",
          attributes: ["name", "especie"],
        },
      ],
      paranoid: false,
    });

    const deletedReadingIds = readings
      .filter((r: any) => r.deleted_at !== null)
      .map((r) => r.id);
    const updatedReadings = readings.filter((r: any) => r.deleted_at == null);

    return {
      plants: {
        updated: updatedPlants,
        deletedIds: deletedPlantIds,
      },
      readings: {
        updated: updatedReadings,
        deletedIds: deletedReadingIds,
      },
    };
  }
}
