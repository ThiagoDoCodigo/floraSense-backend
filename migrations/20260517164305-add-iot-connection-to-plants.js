"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Plants", "isConnected", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("Plants", "macAddress", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Plants", "firmwareVersion", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Plants", "lastConnectionDate", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Plants", "isConnected");
    await queryInterface.removeColumn("Plants", "macAddress");
    await queryInterface.removeColumn("Plants", "firmwareVersion");
    await queryInterface.removeColumn("Plants", "lastConnectionDate");
  },
};
