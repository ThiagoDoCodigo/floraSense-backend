import { FastifyInstance } from "fastify";
import { usersController } from "./user.container";
import {
  createUserSchemaAdmin,
  updateUserSchemaAdmin,
  listUsersSchema,
  deleteUserSchema,
  updateUserSchemaSelf,
  createUserSchemaPublic,
  changePasswordSchema,
} from "./user.schema";
import { requireRole } from "../../middlewares/roleGuard";
import {
  UserRole,
  AdminCreateUserDTO,
  PublicCreateUserDTO,
  UpdateUserSelfDTO,
  UpdateUserAdminDTO,
  ListUsersParams,
} from "./user.types";

export async function usersRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: PublicCreateUserDTO }>(
    "/public",
    {
      schema: createUserSchemaPublic,
    },
    usersController.createPublic.bind(usersController),
  );

  fastify.register(async (protectedInstance) => {
    protectedInstance.addHook("preHandler", protectedInstance.verifyAuthToken);

    protectedInstance.get(
      "/me",
      {},
      usersController.getMe.bind(usersController),
    );

    protectedInstance.post<{ Body: AdminCreateUserDTO }>(
      "/admin",
      {
        schema: createUserSchemaAdmin,
        preHandler: requireRole(
          [UserRole.ADMIN],
          "criar usuários através do painel",
        ),
      },
      usersController.createAdmin.bind(usersController),
    );

    protectedInstance.get<{ Querystring: ListUsersParams }>(
      "/",
      {
        schema: listUsersSchema,
        preHandler: requireRole([UserRole.ADMIN], "listar usuários"),
      },
      usersController.list.bind(usersController),
    );

    protectedInstance.patch<{ Body: UpdateUserSelfDTO }>(
      "/self",
      {
        schema: updateUserSchemaSelf,
      },
      usersController.updateSelf.bind(usersController),
    );

    protectedInstance.patch<{
      Body: UpdateUserAdminDTO;
      Params: { id: string };
    }>(
      "/admin/:id",
      {
        schema: updateUserSchemaAdmin,
        preHandler: requireRole([UserRole.ADMIN], "atualizar outros usuários"),
      },
      usersController.updateAdmin.bind(usersController),
    );

    protectedInstance.delete<{ Params: { id: string } }>(
      "/admin/:id",
      {
        schema: deleteUserSchema,
        preHandler: requireRole([UserRole.ADMIN], "excluir usuários"),
      },
      usersController.deleteAdmin.bind(usersController),
    );

    protectedInstance.patch<{ Body: import("./user.types").ChangePasswordDTO }>(
      "/self/password",
      {
        schema: changePasswordSchema,
      },
      usersController.changePassword.bind(usersController),
    );
  });
}
