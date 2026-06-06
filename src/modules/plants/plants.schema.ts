import { FastifySchema } from "fastify";
import {
  PlantPhaseEnum,
  EnvironmentTypeEnum,
  SunlightExposureEnum,
  SubstrateTypeEnum,
} from "./plants.types";

export const createPlantSchema: FastifySchema = {
  headers: {
    type: "object",
    required: ["content-type"],
    properties: {
      "content-type": {
        type: "string",
        pattern: "^multipart/form-data",
        errorMessage: {
          pattern: "O tipo de conteúdo deve ser multipart/form-data.",
        },
      },
    },
    errorMessage: {
      required: {
        "content-type": "O cabeçalho Content-Type é obrigatório.",
      },
    },
  },
};

export const updatePlantSchema: FastifySchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        errorMessage: {
          type: "O ID deve ser um texto válido",
          format: "O ID informado é inválido. Deve estar no formato UUID.",
        },
      },
    },
    errorMessage: {
      required: { id: "O ID da planta é obrigatório." },
    },
  },
  headers: {
    type: "object",
    required: ["content-type"],
    properties: {
      "content-type": {
        type: "string",
        pattern: "^multipart/form-data",
        errorMessage: {
          pattern: "O tipo de conteúdo deve ser multipart/form-data.",
        },
      },
    },
    errorMessage: {
      required: {
        "content-type": "O cabeçalho Content-Type é obrigatório.",
      },
    },
  },
};

export const listPlantsSchema: FastifySchema = {
  querystring: {
    type: "object",
    properties: {
      page: {
        type: "integer",
        minimum: 1,
        default: 1,
        errorMessage: {
          type: "O número da página deve ser numérico",
          minimum: "O número da página deve ser maior ou igual a 1",
        },
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        default: 10,
        errorMessage: {
          type: "O limite deve ser numérico",
          minimum: "O limite deve ser maior ou igual a 1",
          maximum: "O limite não pode ser maior que 100",
        },
      },
      name: {
        type: "string",
        minLength: 3,
        errorMessage: {
          type: "O nome deve ser um texto válido",
          minLength: "O nome da planta deve ter no mínimo 3 caracteres",
        },
      },
      especie: {
        type: "string",
        minLength: 3,
        errorMessage: {
          type: "O nome deve ser um texto válido",
          minLength: "O nome da planta deve ter no mínimo 3 caracteres",
        },
      },
      phaseOfLife: {
        type: "string",
        enum: Object.values(PlantPhaseEnum),
        errorMessage: {
          enum: "Filtro de fase de vida inválido.",
        },
      },
      userId: {
        type: "string",
        format: "uuid",
        errorMessage: { format: "Filtro de ID de usuário inválido." },
      },
    },
    additionalProperties: false,
    errorMessage: {
      additionalProperties:
        "Foram enviados parâmetros não reconhecidos na URL.",
    },
  },
};

export const getOrDeletePlantSchema: FastifySchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        errorMessage: {
          type: "O ID deve ser um texto válido",
          format: "O ID informado é inválido. Deve estar no formato UUID.",
        },
      },
    },
    errorMessage: {
      required: { id: "O ID da planta é obrigatório." },
    },
  },
};

export const connectDeviceSchema: FastifySchema = {
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
    errorMessage: { required: { id: "O ID da planta é obrigatório." } },
  },
  body: {
    type: "object",
    required: ["macAddress"],
    properties: {
      macAddress: {
        type: "string",
        minLength: 1,
        errorMessage: {
          type: "O Endereço MAC deve ser válido.",
          minLength: "Endereço MAC obrigatório.",
        },
      },
      firmwareVersion: {
        type: "string",
        minLength: 1,
        errorMessage: { type: "Versão do firmware deve ser válido." },
      },
    },
    additionalProperties: false,
    errorMessage: {
      required: {
        macAddress: "O Endereço MAC do dispositivo é obrigatório para conexão.",
      },
      additionalProperties: "Campos não reconhecidos enviados.",
    },
  },
};

export const getIndicatorsSchema: FastifySchema = {
  response: {
    200: {
      type: "object",
      properties: {
        totalPlants: { type: "integer" },
        plantsInAttention: { type: "integer" },
        averageSoilMoisture: { type: "number" },
        averageTemperature: { type: "number" },
      },
    },
  },
};

export const updateIntervalSchema: FastifySchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "string", format: "uuid" } },
  },
  body: {
    type: "object",
    required: ["intervalMinutes"],
    properties: { intervalMinutes: { type: "integer", minimum: 15 } },
    additionalProperties: false,
  },
};

export const actionDeviceSchema: FastifySchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "string", format: "uuid" } },
  },
};
