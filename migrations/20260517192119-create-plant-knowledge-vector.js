"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. ATIVA A EXTENSÃO VETORIAL NO POSTGRES (Precisa de permissão de superuser no banco)
    await queryInterface.sequelize.query(
      "CREATE EXTENSION IF NOT EXISTS vector;",
    );

    // 2. CRIA A TABELA DE CONHECIMENTO
    await queryInterface.createTable("PlantKnowledges", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      specieName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contentChunk: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      embedding: {
        type: "vector(3072)",
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // await queryInterface.sequelize.query(
    //   `CREATE INDEX plant_knowledge_embedding_idx ON "PlantKnowledges" USING hnsw (embedding vector_cosine_ops);`,
    // );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("PlantKnowledges");
    // Não dropamos a extensão vector pois outras tabelas podem usá-la no futuro
  },
};
