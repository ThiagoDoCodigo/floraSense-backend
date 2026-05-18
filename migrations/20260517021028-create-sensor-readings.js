"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SensorReadings", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      plantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Plants",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      soilMoisture: { type: Sequelize.FLOAT, allowNull: false },
      temperature: { type: Sequelize.FLOAT, allowNull: false },
      airHumidity: { type: Sequelize.FLOAT, allowNull: false },
      nitrogen: { type: Sequelize.FLOAT, allowNull: false },
      phosphorus: { type: Sequelize.FLOAT, allowNull: false },
      potassium: { type: Sequelize.FLOAT, allowNull: false },
      aiDiagnosis: { type: Sequelize.TEXT, allowNull: false },
      actionRecommended: { type: Sequelize.TEXT, allowNull: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex("SensorReadings", ["plantId"], {
      name: "sensor_readings_plant_id_idx",
    });
    await queryInterface.addIndex("SensorReadings", ["created_at"], {
      name: "sensor_readings_created_at_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("SensorReadings");
  },
};
