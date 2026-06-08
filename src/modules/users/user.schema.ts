import { FastifySchema } from "fastify";
import { UserRole } from "./user.types";

export const createUserSchemaAdmin: FastifySchema = {
  body: {
    type: "object",
    required: ["name", "email", "password", "role"],
    properties: {
      name: {
        type: "string",
        minLength: 3,
        errorMessage: {
          type: "O nome deve ser um texto válido",
          minLength: "O nome deve ter no mínimo 3 caracteres",
        },
      },
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
      role: {
        type: "string",
        enum: Object.values(UserRole),
        errorMessage: {
          type: "O cargo deve ser um texto válido",
          enum: `O cargo informado é inválido. Deve ser um dos seguintes: ${Object.values(UserRole).join(", ")}.`,
        },
      },
    },
    additionalProperties: false,
    errorMessage: {
      required: {
        name: "O nome é obrigatório.",
        email: "O e-mail é obrigatório.",
        password: "A senha é obrigatória.",
        role: 'O campo "role" (cargo) é obrigatório.',
      },
      additionalProperties:
        "Foram enviados campos não reconhecidos no corpo da requisição. Verifique os dados e tente novamente.",
    },
  },
};

export const createUserSchemaPublic: FastifySchema = {
  body: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: {
        type: "string",
        minLength: 3,
        errorMessage: {
          type: "O nome deve ser um texto válido",
          minLength: "O nome deve ter no mínimo 3 caracteres",
        },
      },
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
        name: "O nome é obrigatório.",
        email: "O e-mail é obrigatório.",
        password: "A senha é obrigatória.",
        role: 'O campo "role" (cargo) é obrigatório.',
      },
      additionalProperties:
        "Foram enviados campos não reconhecidos no corpo da requisição. Verifique os dados e tente novamente.",
    },
  },
};

export const updateUserSchemaAdmin: FastifySchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        errorMessage: {
          type: "O ID deve ser um texto válido",
          format:
            "O ID informado é inválido. Deve estar no formato UUID válido.",
        },
      },
    },
    errorMessage: {
      required: {
        id: "O ID do usuário é obrigatório.",
      },
    },
  },
  body: {
    type: "object",
    minProperties: 1,
    properties: {
      name: {
        type: "string",
        minLength: 3,
        errorMessage: {
          type: "O nome deve ser um texto válido",
          minLength: "O nome deve ter no mínimo 3 caracteres",
        },
      },
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
      minProperties: "É necessário enviar ao menos um campo para atualização.",
      additionalProperties:
        "Foram enviados campos não reconhecidos no corpo da requisição.",
    },
  },
};

export const updateUserSchemaSelf: FastifySchema = {
  body: {
    type: "object",
    minProperties: 1,
    properties: {
      name: {
        type: "string",
        minLength: 3,
        errorMessage: {
          type: "O nome deve ser um texto válido",
          minLength: "O nome deve ter no mínimo 3 caracteres",
        },
      },
      email: {
        type: "string",
        format: "email",
        errorMessage: {
          type: "O e-mail deve ser um texto válido",
          format: "O e-mail informado é inválido. Verifique o formato.",
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

export const listUsersSchema: FastifySchema = {
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
          type: "O filtro de nome deve ser um texto válido",
          minLength: "O filtro de nome deve ter no mínimo 3 caracteres",
        },
      },
      role: {
        type: "string",
        enum: Object.values(UserRole),
        errorMessage: {
          type: "O filtro de cargo deve ser um texto válido",
          enum: `O cargo informado é inválido. Deve ser um dos seguintes: ${Object.values(UserRole).join(", ")}.`,
        },
      },
    },
    additionalProperties: false,
    errorMessage: {
      additionalProperties:
        "Foram enviados parâmetros não reconhecidos na URL.",
    },
  },
};

export const deleteUserSchema: FastifySchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        errorMessage: {
          type: "O ID deve ser um texto válido",
          format:
            "O ID informado é inválido. Deve estar no formato UUID válido.",
        },
      },
    },
    errorMessage: {
      required: {
        id: "O ID do usuário é obrigatório para a exclusão.",
      },
    },
  },
};

export const changePasswordSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    properties: {
      currentPassword: {
        type: "string",
        minLength: 1,
        errorMessage: {
          type: "A senha atual deve ser um texto",
          minLength: "A senha atual é obrigatória",
        },
      },
      newPassword: {
        type: "string",
        minLength: 6,
        errorMessage: {
          type: "A nova senha deve ser um texto válido",
          minLength: "A nova senha deve ter no mínimo 6 caracteres",
        },
      },
    },
    additionalProperties: false,
    errorMessage: {
      required: {
        currentPassword: "A senha atual é obrigatória.",
        newPassword: "A nova senha é obrigatória.",
      },
      additionalProperties: "Foram enviados campos não reconhecidos.",
    },
  },
};

export const forgotPasswordSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["email"],
    properties: {
      email: {
        type: "string",
        format: "email",
        errorMessage: {
          format: "O e-mail informado é inválido.",
        },
      },
    },
    errorMessage: { required: { email: "O e-mail é obrigatório." } },
  },
};

export const resetPasswordSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["email", "code", "newPassword"],
    properties: {
      email: { type: "string", format: "email" },
      code: {
        type: "string",
        minLength: 6,
        maxLength: 6,
        errorMessage: {
          minLength: "O código deve ter 6 dígitos.",
          maxLength: "O código deve ter 6 dígitos.",
        },
      },
      newPassword: {
        type: "string",
        minLength: 6,
        errorMessage: {
          minLength: "A nova senha deve ter no mínimo 6 caracteres.",
        },
      },
    },
    errorMessage: {
      required: {
        email: "O e-mail é obrigatório.",
        code: "O código de verificação é obrigatório.",
        newPassword: "A nova senha é obrigatória.",
      },
    },
  },
};
