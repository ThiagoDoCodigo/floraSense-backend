import {
  Sequelize,
  DataTypes,
  Model,
  Optional,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
} from "sequelize";
import { v7 as uuidv7 } from "uuid";
import {
  EnvironmentTypeEnum,
  PlantPhaseEnum,
  SubstrateTypeEnum,
  SunlightExposureEnum,
} from "../plants.types";
import { User } from "../../users/models/user.model";
import { SensorReading } from "../../sensor_readings/models/sensor_reading.model";

export interface PlantAttributes {
  id: string;
  userId: string;
  name: string;
  especie: string;
  phaseOfLife: PlantPhaseEnum;
  environmentType: EnvironmentTypeEnum;
  sunlightExposure: SunlightExposureEnum;
  substrateType: SubstrateTypeEnum;
  plantingDate: Date | null;
  isConnected: boolean;
  macAddress: string | null;
  firmwareVersion: string | null;
  lastConnectionDate: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type PlantCreationAttributes = Optional<
  PlantAttributes,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;

export class Plant
  extends Model<PlantAttributes, PlantCreationAttributes>
  implements PlantAttributes
{
  public id!: string;
  public userId!: string;
  public name!: string;
  public especie!: string;
  public phaseOfLife!: PlantPhaseEnum;
  public environmentType!: EnvironmentTypeEnum;
  public sunlightExposure!: SunlightExposureEnum;
  public substrateType!: SubstrateTypeEnum;
  public plantingDate!: Date | null;
  public isConnected!: boolean;
  public macAddress!: string | null;
  public firmwareVersion!: string | null;
  public lastConnectionDate!: Date | null;

  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at!: Date | null;

  public user?: User;
  public getUser!: BelongsToGetAssociationMixin<User>;

  public sensor_readings?: SensorReading[];
  public getSensor_readings!: HasManyGetAssociationsMixin<SensorReading>;
}

export function initPlantModel(sequelize: Sequelize) {
  Plant.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv7(),
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      especie: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phaseOfLife: {
        type: DataTypes.ENUM(...Object.values(PlantPhaseEnum)),
        allowNull: false,
      },
      environmentType: {
        type: DataTypes.ENUM(...Object.values(EnvironmentTypeEnum)),
        allowNull: false,
      },
      sunlightExposure: {
        type: DataTypes.ENUM(...Object.values(SunlightExposureEnum)),
        allowNull: false,
      },
      substrateType: {
        type: DataTypes.ENUM(...Object.values(SubstrateTypeEnum)),
        allowNull: false,
      },
      plantingDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isConnected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      macAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      firmwareVersion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastConnectionDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
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
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "Plants",
      modelName: "Plant",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      indexes: [
        {
          name: "plants_user_id_idx",
          fields: ["userId"],
        },
        {
          name: "plants_name_idx",
          fields: ["name"],
        },
      ],
    },
  );
}
