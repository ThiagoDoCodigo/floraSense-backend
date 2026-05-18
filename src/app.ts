import Fastify, { FastifyError } from "fastify";
import dotenv from "dotenv";
import { fastifyCors } from "@fastify/cors";
import AjvErrors from "ajv-errors";
import Routes from "./routes/routes";
import { AuthJWT } from "./middlewares/authJWT";
import { AuthToken } from "./middlewares/authToken";
import sequelizeSetup from "./data/sequelize.setup";
import websocketSetup from "./utils/plugins/websocket.setup";

dotenv.config();

export const app = Fastify({
  logger: false,
  ajv: {
    customOptions: {
      coerceTypes: true,
      useDefaults: true,
      allErrors: true,
      removeAdditional: false,
      strict: true,
    },
    plugins: [AjvErrors as any],
  },
});

app.setErrorHandler((error, request, reply) => {
  const err = error as FastifyError;

  if (err.validation) {
    const message = err.validation[0]?.message || "Erro de validação";
    return reply
      .status(400)
      .send({ statusCode: 400, error: "Bad Request", message });
  }

  if (err.statusCode && err.statusCode < 500) {
    return reply.status(err.statusCode).send(err);
  }

  request.log.error(err);
  return reply.status(500).send({
    statusCode: 500,
    error: "Internal Server Error",
    message: "Ocorreu um erro inesperado no servidor.",
  });
});

app.register(fastifyCors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflight: true,
});

export const setupApp = async () => {
  await AuthJWT.getInstance().initialize(app);
  AuthToken(app);
  app.register(Routes);
  await app.register(sequelizeSetup);
  await app.register(websocketSetup);
  return app;
};
