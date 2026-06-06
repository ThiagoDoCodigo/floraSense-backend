import { FastifyInstance } from "fastify";
import { getDeltaSyncSchema } from "./sync.schema";
import { requireRole } from "../../middlewares/roleGuard";
import { UserRole } from "../users/user.types";
import { syncController } from "./sync.container";
import { SyncDeltaParams } from "./sync.types";

export async function syncRoutes(fastify: FastifyInstance) {
  fastify.register(async (protectedInstance: FastifyInstance) => {
    protectedInstance.addHook("preHandler", protectedInstance.verifyAuthToken);

    protectedInstance.get<{ Querystring: SyncDeltaParams }>(
      "/delta",
      {
        schema: getDeltaSyncSchema,
        preHandler: requireRole(
          [UserRole.ADMIN, UserRole.USER],
          "sincronizar dados localmente",
        ),
      },
      syncController.getDelta.bind(syncController),
    );
  });
}
