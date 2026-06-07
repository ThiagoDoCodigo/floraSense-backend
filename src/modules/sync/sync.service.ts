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
    const LIMIT = 100;
    const serverTime = new Date().toISOString();

    const plantWhere: any = { userId };

    if (lastSync) {
      plantWhere.updated_at = { [Op.gt]: new Date(lastSync) };
    }

    const plants = await Plant.findAll({
      where: plantWhere,
      paranoid: false,
      limit: LIMIT,
      order: [["updated_at", "DESC"]],
    });

    const deletedPlantIds = plants
      .filter((p) => p.deleted_at !== null)
      .map((p) => p.id);
    const updatedPlants = plants.filter((p) => p.deleted_at === null);

    const userPlants = await Plant.findAll({
      where: { userId },
      attributes: ["id"],
      paranoid: false,
    });
    const plantIds = userPlants.map((p) => p.id);

    const readingWhere: any = { plantId: { [Op.in]: plantIds } };

    if (lastSync) {
      readingWhere.updated_at = { [Op.gt]: new Date(lastSync) };
    }

    const readings = await SensorReading.findAll({
      where: readingWhere,
      paranoid: false,
      limit: LIMIT,
      order: [["updated_at", "DESC"]],
    });

    const deletedReadingIds = readings
      .filter((r) => r.deleted_at !== null)
      .map((r) => r.id);

    const updatedReadings = readings.filter(
      (r) => r.deleted_at === null && !deletedPlantIds.includes(r.plantId),
    );

    return {
      plants: {
        updated: updatedPlants,
        deletedIds: deletedPlantIds,
      },
      readings: {
        updated: updatedReadings,
        deletedIds: deletedReadingIds,
      },
      nextSyncToken: serverTime,
    };
  }
}
