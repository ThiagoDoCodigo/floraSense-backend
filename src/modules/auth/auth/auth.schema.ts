import { FastifySchema } from "fastify";

export const loginSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        errorMessage: {
          type: "O e-mail deve ser um texto válido",
          format: "O e-mail informado é inválido. Verifique o formato.",
        },
      },
      password: {
        type: "string",
        minLength: 6,
        errorMessage: {
          type: "A senha deve ser um texto válido",
          minLength: "A senha deve ter no mínimo 6 caracteres",
        },
      },
    },
    additionalProperties: false,
    errorMessage: {
      required: {
        email: "O e-mail é obrigatório.",
        password: "A senha é obrigatória.",
      },
      additionalProperties:
        "Foram enviados campos não reconhecidos no corpo da requisição.",
    },
  },
};

export const refreshTokenSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: {
        type: "string",
        minLength: 1,
        errorMessage: {
          type: "O token de atualização deve ser um texto válido",
          minLength: "O token de atualização não pode estar vazio",
        },
      },
    },
    additionalProperties: false,
    errorMessage: {
      required: {
        refreshToken: "O token de atualização (refreshToken) é obrigatório.",
      },
      additionalProperties:
        "Foram enviados campos não reconhecidos no corpo da requisição.",
    },
  },
};
