import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import sequelize from "./database";
import { initUserModel, User } from "../modules/users/models/user.model";
import { initPlantModel, Plant } from "../modules/plants/models/plant.model";
import {
  initSensorReadingModel,
  SensorReading,
} from "../modules/sensor_readings/models/sensor_reading.model";
import {
  initPlantKnowledgeModel,
  PlantKnowledge,
} from "../modules/plants/models/plant_knowledge.model";

declare module "fastify" {
  interface FastifyInstance {
    sequelize: typeof sequelize;
    models: {
      User: typeof User;
      Plant: typeof Plant;
    };
  }
}

export default fp(async (fastify: FastifyInstance) => {
  initUserModel(sequelize);
  initPlantModel(sequelize);
  initSensorReadingModel(sequelize);
  initPlantKnowledgeModel(sequelize);

  User.hasMany(Plant, {
    foreignKey: "userId",
    as: "plants",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  Plant.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  Plant.hasMany(SensorReading, {
    foreignKey: "plantId",
    as: "sensor_readings",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  SensorReading.belongsTo(Plant, {
    foreignKey: "plantId",
    as: "plant",
  });

  fastify.decorate("sequelize", sequelize);
  fastify.decorate("models", {
    User,
    Plant,
    SensorReading,
    PlantKnowledge,
  });

  await sequelize.authenticate();
});
