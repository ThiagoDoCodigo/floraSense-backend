import {
  UniqueConstraintError,
  ValidationError,
  DatabaseError,
  EagerLoadingError,
  ForeignKeyConstraintError,
  ExclusionConstraintError,
  TimeoutError,
  ConnectionError,
  AggregateError,
} from "sequelize";
import { CustomError } from "./CustomError";

export function handleSequelizeError(err: unknown, entity: string): never {
  if (err instanceof UniqueConstraintError) {
    const fields = err.errors.map((e) => e.path).join(", ");
    throw new CustomError(
      `Já existe um(a) ${entity.toLowerCase()} com o mesmo valor em: ${fields}.`,
      409,
      "UniqueConstraintError",
    );
  }

  if (err instanceof ValidationError) {
    const messages = err.errors.map((e) => e.message).join("; ");
    throw new CustomError(
      `Os dados fornecidos para ${entity.toLowerCase()} são inválidos: ${messages}.`,
      400,
      "ValidationError",
    );
  }

  if (err instanceof ForeignKeyConstraintError) {
    throw new CustomError(
      `Não é possível concluir a operação: o(a) ${entity.toLowerCase()} está vinculado(a) a outro registro.`,
      409,
      "ForeignKeyConstraintError",
    );
  }

  if (err instanceof ExclusionConstraintError) {
    throw new CustomError(
      `Alguns dados de ${entity.toLowerCase()} entram em conflito com registros existentes.`,
      409,
      "ExclusionConstraintError",
    );
  }

  if (err instanceof TimeoutError) {
    throw new CustomError(
      `A operação com ${entity.toLowerCase()} demorou demais. Tente novamente mais tarde.`,
      504,
      "TimeoutError",
    );
  }

  if (err instanceof ConnectionError) {
    throw new CustomError(
      "Não foi possível se conectar ao banco de dados. Verifique sua conexão.",
      503,
      "ConnectionError",
    );
  }

  if (err instanceof DatabaseError) {
    throw new CustomError(
      `Ocorreu um erro ao acessar o banco de dados relacionado a ${entity.toLowerCase()}.`,
      500,
      "DatabaseError",
    );
  }

  if (err instanceof EagerLoadingError) {
    throw new CustomError(
      `Erro ao carregar dados associados a ${entity.toLowerCase()}.`,
      500,
      "EagerLoadingError",
    );
  }

  if (err instanceof AggregateError) {
    throw new CustomError(
      `Ocorreram múltiplos erros ao processar ${entity.toLowerCase()}.`,
      400,
      "AggregateError",
    );
  }

  if (err instanceof CustomError) {
    throw err;
  }

  const msg = err instanceof Error ? err.message : "Erro interno inesperado.";
  throw new CustomError(
    `Ocorreu um erro ao processar ${entity.toLowerCase()}: ${msg}`,
    500,
    "GenericError",
  );
}
