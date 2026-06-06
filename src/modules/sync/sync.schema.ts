import { FastifySchema } from "fastify";

export const getDeltaSyncSchema: FastifySchema = {
  querystring: {
    type: "object",
    properties: {
      lastSync: {
        type: "string",
        format: "date-time",
        errorMessage: { format: "lastSync deve ser uma data ISO válida." },
      },
    },
    additionalProperties: false,
  },
};
