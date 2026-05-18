import { FastifySchema } from "fastify";
import { LevelUrgentEnum } from "./sensor_readings.types";

export const createReadingSchema: FastifySchema = {
  body: {
    type: "object",
    required: [
      "userId",
      "plantId",
      "macAddress",
      "soilMoisture",
      "temperature",
      "airHumidity",
      "nitrogen",
      "phosphorus",
      "potassium",
    ],
    properties: {
      userId: {
        type: "string",
        format: "uuid",
        errorMessage: { format: "UserID inválido (deve ser UUID)." },
      },
      plantId: {
        type: "string",
        format: "uuid",
        errorMessage: { format: "PlantID inválido (deve ser UUID)." },
      },
      macAddress: {
        type: "string",
        minLength: 1,
        errorMessage: {
          type: "O Endereço MAC deve ser um texto.",
          minLength: "O Endereço MAC não pode ser vazio.",
        },
      },
      soilMoisture: {
        type: "number",
        errorMessage: { type: "A umidade do solo deve ser numérica." },
      },
      temperature: {
        type: "number",
        errorMessage: { type: "A temperatura deve ser numérica." },
      },
      airHumidity: {
        type: "number",
        errorMessage: { type: "A umidade do ar deve ser numérica." },
      },
      nitrogen: {
        type: "number",
        errorMessage: { type: "O nível de Nitrogênio deve ser numérico." },
      },
      phosphorus: {
        type: "number",
        errorMessage: { type: "O nível de Fósforo deve ser numérico." },
      },
      potassium: {
        type: "number",
        errorMessage: { type: "O nível de Potássio deve ser numérico." },
      },
    },
    additionalProperties: false,
    errorMessage: {
      required: {
        userId: "O ID do usuário é obrigatório.",
        plantId: "O ID da planta é obrigatório.",
        macAddress:
          "O Endereço MAC do dispositivo é obrigatório para enviar leituras.",
        soilMoisture: "A umidade do solo é obrigatória.",
        temperature: "A temperatura é obrigatória.",
        airHumidity: "A umidade do ar é obrigatória.",
        nitrogen: "O Nitrogênio é obrigatório.",
        phosphorus: "O Fósforo é obrigatório.",
        potassium: "O Potássio é obrigatório.",
      },
      additionalProperties:
        "Campos não reconhecidos enviados pelo dispositivo.",
    },
  },
};

export const listReadingsSchema: FastifySchema = {
  params: {
    type: "object",
    required: ["plantId"],
    properties: {
      plantId: {
        type: "string",
        format: "uuid",
        errorMessage: { format: "O ID da planta informado é inválido." },
      },
    },
    errorMessage: {
      required: { plantId: "O ID da planta é obrigatório na URL." },
    },
  },
  querystring: {
    type: "object",
    properties: {
      page: {
        type: "integer",
        minimum: 1,
        default: 1,
        errorMessage: {
          type: "Página inválida",
          minimum: "Página deve ser >= 1",
        },
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        default: 10,
        errorMessage: {
          type: "Limite inválido",
          minimum: "Limite deve ser >= 1",
          maximum: "Máximo de 100",
        },
      },
    },
    additionalProperties: false,
  },
};

export const listUrgentReadingsSchema: FastifySchema = {
  querystring: {
    type: "object",
    properties: {
      page: {
        type: "integer",
        minimum: 1,
        default: 1,
        errorMessage: {
          type: "Página inválida",
          minimum: "Página deve ser >= 1",
        },
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        default: 10,
        errorMessage: {
          type: "Limite inválido",
          minimum: "Limite deve ser >= 1",
          maximum: "Máximo de 100",
        },
      },
      plantId: {
        type: "string",
        format: "uuid",
        errorMessage: {
          type: "O ID da planta informado é inválido.",
          format: "O ID da planta informado é inválido.",
        },
      },
      levelUrgent: {
        type: "string",
        enum: Object.values(LevelUrgentEnum),
        errorMessage: {
          type: "O nível de urgência deve ser um dos seguintes: 'baixo', 'medio', 'alto' ou 'crítico'.",
          enum: "O nível de urgência deve ser um dos seguintes: 'baixo', 'medio', 'alto' ou 'crítico'.",
        },
      },
    },
    additionalProperties: false,
  },
};

export const markAsReadSchema: FastifySchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        errorMessage: { format: "ID inválido." },
      },
    },
    errorMessage: { required: { id: "O ID da leitura é obrigatório." } },
  },
};
