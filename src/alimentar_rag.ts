import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DataTypes } from "sequelize";
import { PlantKnowledge } from "./modules/plants/models/plant_knowledge.model";
import sequelize from "./data/database";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "❌ ERRO: A variável GEMINI_API_KEY não foi encontrada no seu .env!",
  );
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

async function alimentarBanco() {
  try {
    // 1. Conecta ao banco de dados
    await sequelize.authenticate();
    console.log("🔗 Conectado ao banco de dados PostgreSQL com sucesso.");

    // 2. CORREÇÃO DO SEQUELIZE: Inicializa o modelo na memória do script isolado
    // Isso evita o erro de "Cannot read properties of undefined"
    if (
      !(PlantKnowledge as any).initiated &&
      !(PlantKnowledge as any).sequelize
    ) {
      PlantKnowledge.init(
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          specieName: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          contentChunk: {
            type: DataTypes.TEXT,
            allowNull: false,
          },
          embedding: {
            type: DataTypes.JSONB,
            allowNull: false,
          },
        },
        {
          sequelize,
          modelName: "PlantKnowledge",
          tableName: "PlantKnowledges",
          timestamps: false,
        },
      );
      console.log(
        "🛠️ Mapeamento do modelo PlantKnowledge inicializado para o script.",
      );
    }

    // 3. Dados botânicos para alimentar o RAG do FloraSense
    const plantasParaSalvar = [
      {
        specieName: "Solanum lycopersicum",
        dados:
          "O tomateiro exige alta luminosidade (sol pleno). A umidade do solo ideal é entre 60% e 80%. Temperaturas ótimas para crescimento estão entre 20°C e 25°C. A demanda por Nitrogênio e Potássio é altíssima na fase de frutificação.",
      },
      {
        specieName: "Monstera deliciosa",
        dados:
          "A Costela-de-Adão prefere luz indireta ou meia-sombra. A umidade do solo deve cair um pouco antes de nova rega. Temperatura ideal entre 18°C e 27°C. Adubação equilibrada NPK 10-10-10 na primavera.",
      },
    ];

    // 4. Executa o loop de geração e inserção
    for (const planta of plantasParaSalvar) {
      console.log(`🧠 Gerando vetor via Gemini para: ${planta.specieName}...`);

      const result = await model.embedContent(planta.dados);
      const vetor = result.embedding.values;

      console.log(
        `💾 Salvando dados e vetor de ${vetor.length} dimensões no banco...`,
      );

      await PlantKnowledge.create({
        specieName: planta.specieName,
        contentChunk: planta.dados,
        embedding: vetor,
      });
    }

    console.log("🚀 RAG Alimentado com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante a execução:", error);
  } finally {
    await sequelize.close();
    console.log("🔌 Conexão com o banco encerrada.");
  }
}

// Executa a carga
alimentarBanco();
