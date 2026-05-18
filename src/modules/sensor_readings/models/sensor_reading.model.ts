import {
  Sequelize,
  DataTypes,
  Model,
  Optional,
  BelongsToGetAssociationMixin,
} from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { Plant } from "../../plants/models/plant.model";
import { LevelUrgentEnum } from "../sensor_readings.types";

export interface SensorReadingAttributes {
  id: string;
  plantId: string;
  soilMoisture: number;
  temperature: number;
  airHumidity: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  aiDiagnosis: string;
  actionRecommended: string;
  isUrgent: boolean;
  levelUrgent: LevelUrgentEnum | null;
  isRead: boolean;
  parametersIdeas: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type SensorReadingCreationAttributes = Optional<
  SensorReadingAttributes,
  "id" | "created_at" | "updated_at" | "deleted_at" | "isRead" | "isUrgent"
>;

export class SensorReading
  extends Model<SensorReadingAttributes, SensorReadingCreationAttributes>
  implements SensorReadingAttributes
{
  public id!: string;
  public plantId!: string;
  public soilMoisture!: number;
  public temperature!: number;
  public airHumidity!: number;
  public nitrogen!: number;
  public phosphorus!: number;
  public potassium!: number;
  public aiDiagnosis!: string;
  public actionRecommended!: string;
  public isUrgent!: boolean;
  public levelUrgent!: LevelUrgentEnum | null;
  public isRead!: boolean;
  public parametersIdeas!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at!: Date | null;

  public plant?: Plant;
  public getPlant!: BelongsToGetAssociationMixin<Plant>;
}

export function initSensorReadingModel(sequelize: Sequelize) {
  SensorReading.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv7(),
        primaryKey: true,
      },
      plantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Plants",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      soilMoisture: { type: DataTypes.FLOAT, allowNull: false },
      temperature: { type: DataTypes.FLOAT, allowNull: false },
      airHumidity: { type: DataTypes.FLOAT, allowNull: false },
      nitrogen: { type: DataTypes.FLOAT, allowNull: false },
      phosphorus: { type: DataTypes.FLOAT, allowNull: false },
      potassium: { type: DataTypes.FLOAT, allowNull: false },
      aiDiagnosis: { type: DataTypes.TEXT, allowNull: false },
      actionRecommended: { type: DataTypes.TEXT, allowNull: false },
      isUrgent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      levelUrgent: {
        type: DataTypes.ENUM(...Object.values(LevelUrgentEnum)),
        allowNull: true,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      parametersIdeas: { type: DataTypes.TEXT, allowNull: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      tableName: "SensorReadings",
      modelName: "SensorReading",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      indexes: [
        { name: "sensor_readings_plant_id_idx", fields: ["plantId"] },
        { name: "sensor_readings_created_at_idx", fields: ["created_at"] },
      ],
    },
  );
}
