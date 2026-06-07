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
      const syncDate = new Date(lastSync);
      if (!isNaN(syncDate.getTime())) {
        plantWhere.updated_at = { [Op.gt]: syncDate };
      }
    }

    let plants = await Plant.findAll({
      where: plantWhere,
      paranoid: false,
      limit: LIMIT,
      order: [["updated_at", "DESC"]],
    });

    const userPlants = await Plant.findAll({
      where: { userId },
      attributes: ["id"],
      paranoid: false,
    });
    const plantIds = userPlants.map((p) => p.id);

    const readingWhere: any = { plantId: { [Op.in]: plantIds } };

    if (lastSync) {
      const syncDate = new Date(lastSync);
      if (!isNaN(syncDate.getTime())) {
        readingWhere.updated_at = { [Op.gt]: syncDate };
      }
    }

    const readings = await SensorReading.findAll({
      where: readingWhere,
      paranoid: false,
      limit: LIMIT,
      order: [["updated_at", "DESC"]],
    });

    const readingPlantIds = [...new Set(readings.map((r) => r.plantId))];

    const missingPlantIds = readingPlantIds.filter(
      (id) => !plants.some((p) => p.id === id),
    );

    if (missingPlantIds.length > 0) {
      const missingPlants = await Plant.findAll({
        where: { id: { [Op.in]: missingPlantIds } },
        paranoid: false,
      });
      plants = plants.concat(missingPlants);
    }

    const deletedPlantIds = plants
      .filter((p) => p.deleted_at !== null)
      .map((p) => p.id);
    const updatedPlants = plants
      .filter((p) => p.deleted_at === null)
      .map((p) => p.toJSON());

    const deletedReadingIds = readings
      .filter((r) => r.deleted_at !== null)
      .map((r) => r.id);
    const updatedReadings = readings
      .filter((r) => r.deleted_at === null)
      .map((r) => r.toJSON());

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
