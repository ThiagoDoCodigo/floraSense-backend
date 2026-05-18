import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CustomError } from "./CustomError";

export async function sendError(reply: FastifyReply, err: any) {
  const statusCode =
    err instanceof CustomError && typeof err.statusCode === "number"
      ? err.statusCode
      : 500;

  if (err instanceof CustomError) {
    return reply.code(statusCode).send({ message: err.message });
  }

  return reply.code(500).send({ message: "Erro interno no servidor." });
}
