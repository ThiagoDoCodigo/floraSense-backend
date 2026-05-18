import { app, setupApp } from "./app";
import sequelize from "./data/database";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso.");

    await setupApp();
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
  } catch (err) {
    console.error("❌ Falha fatal ao iniciar o servidor:", err);
    process.exit(1);
  }
};

start();
