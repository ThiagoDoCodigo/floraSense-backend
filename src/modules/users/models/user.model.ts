import {
  Sequelize,
  DataTypes,
  Model,
  Optional,
  HasManyGetAssociationsMixin,
} from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { UserRole } from "../user.types";
import { Plant } from "../../plants/models/plant.model";

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  reset_password_token: string | null;
  reset_password_expires: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  | "id"
  | "role"
  | "reset_password_token"
  | "reset_password_expires"
  | "created_at"
  | "updated_at"
  | "deleted_at"
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public reset_password_token!: string | null;
  public reset_password_expires!: Date | null;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at!: Date | null;

  public plants?: Plant[];
  public getPlants!: HasManyGetAssociationsMixin<Plant>;
}

export function initUserModel(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv7(),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(...Object.values(UserRole)),
        allowNull: false,
        defaultValue: UserRole.USER,
      },
      reset_password_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reset_password_expires: {
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
      tableName: "Users",
      modelName: "User",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      indexes: [
        {
          name: "users_email_idx",
          unique: true,
          fields: ["email"],
        },
        {
          name: "users_name_idx",
          fields: ["name"],
        },
      ],
    },
  );
}
