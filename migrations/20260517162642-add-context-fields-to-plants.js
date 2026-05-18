"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Plants", "environmentType", {
      type: Sequelize.ENUM("INDOOR", "OUTDOOR", "GREENHOUSE"),
      allowNull: false,
      defaultValue: "INDOOR", // Valor default para as plantas que já existem no banco
    });

    await queryInterface.addColumn("Plants", "sunlightExposure", {
      type: Sequelize.ENUM("FULL_SUN", "PARTIAL_SHADE", "SHADOW"),
      allowNull: false,
      defaultValue: "PARTIAL_SHADE",
    });

    await queryInterface.addColumn("Plants", "substrateType", {
      type: Sequelize.ENUM("SOIL", "SANDY", "COCO_PEAT", "HYDROPONIC"),
      allowNull: false,
      defaultValue: "SOIL",
    });

    await queryInterface.addColumn("Plants", "plantingDate", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Plants", "environmentType");
    await queryInterface.removeColumn("Plants", "sunlightExposure");
    await queryInterface.removeColumn("Plants", "substrateType");
    await queryInterface.removeColumn("Plants", "plantingDate");
  },
};
