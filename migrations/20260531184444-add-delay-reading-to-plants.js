"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Plants", "delayReading", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 480, // Valor padrão de 8 horas (em minutos)
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Plants", "delayReading");
  },
};
