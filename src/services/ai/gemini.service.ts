import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { LevelUrgentEnum } from "../../modules/sensor_readings/sensor_readings.types";
import { PlantKnowledge } from "../../modules/plants/models/plant_knowledge.model";
import sequelize from "../../data/database";

export type GeminiDiagnosisResult = {
  aiDiagnosis: string;
  actionRecommended: string;
  isUrgent: boolean;
  levelUrgent: LevelUrgentEnum | null;
  parametersIdeas: string;
};

export class GeminiService {
  private genAIInstance: GoogleGenerativeAI | null = null;
  private readonly modelName = "gemini-2.5-flash-lite";
  private readonly embeddingModelName = "gemini-embedding-001";
  private readonly MAX_RETRIES = 3;

  private getGenAI(): GoogleGenerativeAI {
    if (!this.genAIInstance) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Variável de ambiente GEMINI_API_KEY não configurada.");
      }
      this.genAIInstance = new GoogleGenerativeAI(apiKey);
    }
    return this.genAIInstance;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const genAI = this.getGenAI();
    const model = genAI.getGenerativeModel({ model: this.embeddingModelName });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  private async retrieveAgronomicContext(
    especie: string,
    phaseOfLife: string,
  ): Promise<string> {
    try {
      const searchQuery = `Necessidades hídricas, temperatura, luz e adubação para ${especie} na fase de ${phaseOfLife}`;

      const queryVector = await this.generateEmbedding(searchQuery);

      const results = await PlantKnowledge.findAll({
        attributes: ["contentChunk"],
        order: [
          sequelize.literal(`embedding <-> '[${queryVector.join(",")}]'`),
        ],
        limit: 1,
      });

      if (results.length === 0) {
        return "Nenhum dado específico encontrado no banco para esta espécie.";
      }

      return results[0].contentChunk;
    } catch (error) {
      console.error("[GeminiService] Falha na busca vetorial (RAG):", error);
      return "Dados do banco de botânica temporariamente indisponíveis.";
    }
  }
  public async generatePlantDiagnosis(
    plantData: {
      name: string;
      especie: string;
      phaseOfLife: string;
      environmentType: string;
      sunlightExposure: string;
      substrateType: string;
      plantingDate: Date | null;
    },
    sensorData: {
      soilMoisture: number;
      temperature: number;
      airHumidity: number;
      nitrogen: number;
      phosphorus: number;
      potassium: number;
    },
  ): Promise<GeminiDiagnosisResult> {
    const contextText = await this.retrieveAgronomicContext(
      plantData.especie,
      plantData.phaseOfLife,
    );
    const genAI = this.getGenAI();

    const systemInstruction = `Você é o motor de inteligência agronômica do sistema FloraSense. 
      Sua missão é atuar como um Engenheiro Agrônomo Sênior, analisando telemetria IoT e literatura técnica para salvar plantações e plantas domésticas. 
      Seja incisivo, técnico, clínico e extremamente prático.`;

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        aiDiagnosis: {
          type: SchemaType.STRING,
          description:
            "Diagnóstico fitossanitário ou nutricional detalhado e clínico.",
        },
        actionRecommended: {
          type: SchemaType.STRING,
          description: "Passo a passo prático para correção ou manejo.",
        },
        isUrgent: {
          type: SchemaType.BOOLEAN,
          description:
            "Verdadeiro apenas se a planta puder sofrer danos irreversíveis em menos de 24h.",
        },
        levelUrgent: {
          type: SchemaType.STRING,
          format: "enum",
          enum: Object.values(LevelUrgentEnum) as string[],
          nullable: true,
        },
        parametersIdeas: {
          type: SchemaType.STRING,
          description:
            "Valores ideais obrigatórios no formato exato: 'Umidade Solo: X-Y% | Temp: X-Y°C | NPK: X-Y-Z'.",
        },
      },
      required: [
        "aiDiagnosis",
        "actionRecommended",
        "isUrgent",
        "parametersIdeas",
      ],
    };

    const model = genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
      },
    });

    const prompt = `
    [CONTEXTO TÉCNICO RECUPERADO (LITERATURA)]
    ${contextText !==
        "Nenhum dado específico encontrado no banco para esta espécie."
        ? `Baseie sua avaliação nos seguintes limites oficiais:\n"${contextText}"`
        : "Nenhum dado específico encontrado no banco de dados. Utilize seu treinamento agronômico nativo para inferir os limites adequados."
      }

    [IDENTIFICAÇÃO DO ESPÉCIME]
    - Espécie: ${plantData.especie} (Nome dado pelo usuário: ${plantData.name})
    - Estágio Fenológico: ${plantData.phaseOfLife}
    - Ambiente de Cultivo: ${plantData.environmentType}
    - Exposição Solar: ${plantData.sunlightExposure}
    - Base/Substrato: ${plantData.substrateType}

    [TELEMETRIA EM TEMPO REAL (IOT)]
    - Umidade do Solo: ${sensorData.soilMoisture}%
    - Temperatura do Ar: ${sensorData.temperature}°C
    - Umidade Relativa do Ar: ${sensorData.airHumidity}%
    - Nutrientes (NPK): Nitrogênio ${sensorData.nitrogen} mg/kg | Fósforo ${sensorData.phosphorus} mg/kg | Potássio ${sensorData.potassium} mg/kg

    [DIRETIVAS DE EXECUÇÃO]
    1. Compare a 'Telemetria' com o 'Contexto Técnico'.
    2. Identifique anomalias (déficit hídrico, estresse térmico, deficiência ou toxidez de NPK).
    3. Formule a recomendação baseada na correção da anomalia.
    4. Preencha o JSON com rigor técnico.
    `;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsedData = JSON.parse(
          responseText,
        ) as Partial<GeminiDiagnosisResult>;

        if (!parsedData.aiDiagnosis || !parsedData.actionRecommended) {
          throw new Error("O modelo não retornou as chaves JSON obrigatórias.");
        }

        return {
          aiDiagnosis: parsedData.aiDiagnosis,
          actionRecommended: parsedData.actionRecommended,
          isUrgent: parsedData.isUrgent || false,
          levelUrgent: parsedData.levelUrgent || null,
          parametersIdeas: parsedData.parametersIdeas || "",
        };
      } catch (error) {
        console.warn(
          `[GeminiService] Falha na tentativa ${attempt}/${this.MAX_RETRIES}:`,
          (error as Error).message,
        );

        if (attempt === this.MAX_RETRIES) {
          console.error(
            "[GeminiService] Todas as tentativas falharam. Acionando Fallback.",
          );
          break;
        }
        console.log("---------------------------------------------");
        console.log(error);
        console.log("---------------------------------------------");

        await this.delay(500 * attempt);
      }
    }

    return {
      aiDiagnosis: "Análise de IA temporariamente indisponível.",
      actionRecommended:
        "Continue monitorando os níveis dos sensores através do painel.",
      isUrgent: false,
      levelUrgent: null,
      parametersIdeas: "Umidade Solo: --% | Temp: --°C | NPK: --",
    };
  }
}
