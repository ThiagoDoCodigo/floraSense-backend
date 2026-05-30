import { FastifySchema } from "fastify";
import {
  PlantPhaseEnum,
  EnvironmentTypeEnum,
  SunlightExposureEnum,
  SubstrateTypeEnum,
} from "./plants.types";

export const createPlantSchema: FastifySchema = {
  body: {
    type: "object",
    required: [
      "name",
      "especie",
      "phaseOfLife",
      "environmentType",
      "sunlightExposure",
      "substrateType",
    ],
    properties: {
      name: {
        type: "string",
        minLength: 2,
        errorMessage: {
          type: "O nome deve ser um texto válido",
          minLength: "O nome da planta deve ter no mínimo 2 caracteres",
        },
      },
      especie: {
        type: "string",
        minLength: 2,
        errorMessage: {
          type: "A espécie deve ser um texto válido",
          minLength: "A espécie deve ter no mínimo 2 caracteres",
        },
      },
      phaseOfLife: {
        type: "string",
        enum: Object.values(PlantPhaseEnum),
        errorMessage: {
          type: "A fase de vida deve ser um texto válido",
          enum: `A fase de vida informada é inválida. Deve ser: ${Object.values(PlantPhaseEnum).join(", ")}.`,
        },
      },
      environmentType: {
        type: "string",
        enum: Object.values(EnvironmentTypeEnum),
        errorMessage: {
          type: "O tipo de ambiente deve ser um texto",
          enum: `Tipo de ambiente inválido. Deve ser: ${Object.values(EnvironmentTypeEnum).join(", ")}.`,
        },
      },
      sunlightExposure: {
        type: "string",
        enum: Object.values(SunlightExposureEnum),
        errorMessage: {
          type: "A exposição solar deve ser um texto",
          enum: `Exposição solar inválida. Deve ser: ${Object.values(SunlightExposureEnum).join(", ")}.`,
        },
      },
      substrateType: {
        type: "string",
        enum: Object.values(SubstrateTypeEnum),
        errorMessage: {
          type: "O tipo de substrato deve ser um texto",
          enum: `Tipo de substrato inválido. Deve ser: ${Object.values(SubstrateTypeEnum).join(", ")}.`,
        },
      },
      plantingDate: {
        type: "string",
        format: "date-time",
        errorMessage: {
          type: "A data de plantio deve ser um texto (ISO 8601)",
          format: "A data de plantio informada é inválida.",
        },
      },
    },
    additionalProperties: false,
    errorMessage: {
      required: {
        name: "O nome da planta é obrigatório.",
        especie: "A espécie da planta é obrigatória.",
        phaseOfLife: "A fase de vida da planta é obrigatória.",
        environmentType: "O tipo de ambiente é obrigatório.",
        sunlightExposure: "A exposição solar é obrigatória.",
        substrateType: "O tipo de substrato é obrigatório.",
      },
      additionalProperties:
        "Foram enviados campos não reconhecidos no corpo da requisição.",
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
  body: {
    type: "object",
    minProperties: 1,
    properties: {
      name: {
        type: "string",
        minLength: 2,
        errorMessage: {
          type: "O nome deve ser um texto válido",
          minLength: "O nome da planta deve ter no mínimo 2 caracteres",
        },
      },
      especie: {
        type: "string",
        minLength: 2,
        errorMessage: {
          type: "A espécie deve ser um texto válido",
          minLength: "A espécie deve ter no mínimo 2 caracteres",
        },
      },
      phaseOfLife: {
        type: "string",
        enum: Object.values(PlantPhaseEnum),
        errorMessage: {
          type: "A fase de vida deve ser um texto válido",
          enum: `A fase de vida informada é inválida. Deve ser: ${Object.values(PlantPhaseEnum).join(", ")}.`,
        },
      },
      environmentType: {
        type: "string",
        enum: Object.values(EnvironmentTypeEnum),
        errorMessage: {
          type: "O tipo de ambiente deve ser um texto",
          enum: `Tipo de ambiente inválido. Deve ser: ${Object.values(EnvironmentTypeEnum).join(", ")}.`,
        },
      },
      sunlightExposure: {
        type: "string",
        enum: Object.values(SunlightExposureEnum),
        errorMessage: {
          type: "A exposição solar deve ser um texto",
          enum: `Exposição solar inválida. Deve ser: ${Object.values(SunlightExposureEnum).join(", ")}.`,
        },
      },
      substrateType: {
        type: "string",
        enum: Object.values(SubstrateTypeEnum),
        errorMessage: {
          type: "O tipo de substrato deve ser um texto",
          enum: `Tipo de substrato inválido. Deve ser: ${Object.values(SubstrateTypeEnum).join(", ")}.`,
        },
      },
      plantingDate: {
        type: "string",
        format: "date-time",
        errorMessage: {
          type: "A data de plantio deve ser um texto (ISO 8601)",
          format: "A data de plantio informada é inválida.",
        },
      },
    },
    additionalProperties: false,
    errorMessage: {
      minProperties: "É necessário enviar ao menos um campo para atualização.",
      additionalProperties:
        "Foram enviados campos não reconhecidos no corpo da requisição.",
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
          enum: `Filtro de fase de vida inválido.`,
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
