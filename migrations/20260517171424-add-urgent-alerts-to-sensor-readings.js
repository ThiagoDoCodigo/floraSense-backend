"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("SensorReadings", "isUrgent", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("SensorReadings", "levelUrgent", {
      type: Sequelize.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL"),
      allowNull: true,
    });

    await queryInterface.addColumn("SensorReadings", "isRead", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("SensorReadings", "isUrgent");
    await queryInterface.removeColumn("SensorReadings", "levelUrgent");
    await queryInterface.removeColumn("SensorReadings", "isRead");
  },
};
