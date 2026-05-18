import type { FastifyInstance } from "fastify";
import jwt from "@fastify/jwt";
import dotenv from "dotenv";

dotenv.config();

const JWT_PASSWORD = process.env.JWT_PASSWORD!;
const JWT_LIMIT_ACESS = process.env.JWT_LIMIT_ACESS!;

export class AuthJWT {
  private static instance: AuthJWT;
  private fastify: FastifyInstance | null = null;

  private constructor() {}

  public static getInstance(): AuthJWT {
    if (!AuthJWT.instance) {
      AuthJWT.instance = new AuthJWT();
    }
    return AuthJWT.instance;
  }

  public async initialize(fastify: FastifyInstance): Promise<void> {
    if (this.fastify) return;
    this.fastify = fastify;

    const secret = process.env.JWT_PASSWORD;
    const expiresIn = process.env.JWT_LIMIT_ACESS;

    if (!secret || !expiresIn) {
      throw new Error(
        "Variáveis de ambiente do JWT ausentes (JWT_PASSWORD ou JWT_LIMIT_ACESS).",
      );
    }

    await this.fastify.register(jwt, {
      secret: secret,
      sign: { expiresIn: expiresIn },
    });
  }

  public async sign(payload: object): Promise<string> {
    if (!this.fastify) throw new Error("AuthJWT não inicializado!");
    return this.fastify.jwt.sign(payload);
  }

  public async verify(token: string): Promise<object | null | string> {
    if (!this.fastify) throw new Error("AuthJWT não inicializado!");
    try {
      return this.fastify.jwt.verify(token);
    } catch {
      return null;
    }
  }

  public async decode(token: string): Promise<object | null> {
    if (!this.fastify) throw new Error("AuthJWT não inicializado!");
    try {
      return this.fastify.jwt.decode(token);
    } catch {
      return null;
    }
  }
}
