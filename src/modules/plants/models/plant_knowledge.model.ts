import { Sequelize, DataTypes, Model, Optional } from "sequelize";

export interface PlantKnowledgeAttributes {
  id: string;
  specieName: string;
  contentChunk: string;
  embedding: number[];
  created_at?: Date;
  updated_at?: Date;
}

export type PlantKnowledgeCreationAttributes = Optional<
  PlantKnowledgeAttributes,
  "id"
>;

export class PlantKnowledge
  extends Model<PlantKnowledgeAttributes, PlantKnowledgeCreationAttributes>
  implements PlantKnowledgeAttributes
{
  public id!: string;
  public specieName!: string;
  public contentChunk!: string;
  public embedding!: number[];
}

export function initPlantKnowledgeModel(sequelize: Sequelize) {
  PlantKnowledge.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      specieName: { type: DataTypes.STRING, allowNull: false },
      contentChunk: { type: DataTypes.TEXT, allowNull: false },
      embedding: { type: DataTypes.ARRAY(DataTypes.FLOAT), allowNull: false },
    },
    {
      sequelize,
      tableName: "PlantKnowledges",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
}
