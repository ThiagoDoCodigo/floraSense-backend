import { FastifyRequest, FastifyReply } from "fastify";
import { UsersBusiness } from "./user.business";
import { sendError } from "../../utils/errors/sendError";
import { CustomError } from "../../utils/errors/CustomError";
import {
  AdminCreateUserDTO,
  PublicCreateUserDTO,
  ListUsersParams,
  UpdateUserSelfDTO,
  UpdateUserAdminDTO,
} from "./user.types";

export class UsersController {
  private readonly usersBusiness: UsersBusiness;

  constructor(usersBusiness: UsersBusiness) {
    this.usersBusiness = usersBusiness;
  }

  public async createAdmin(
    request: FastifyRequest<{ Body: AdminCreateUserDTO }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.usersBusiness.createAdminUser(request.body);
      return reply.code(201).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async createPublic(
    request: FastifyRequest<{ Body: PublicCreateUserDTO }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.usersBusiness.createPublicUser(request.body);
      return reply.code(201).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async updateAdmin(
    request: FastifyRequest<{
      Body: UpdateUserAdminDTO;
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.authUser?.id_user;

      if (!userId) {
        throw new CustomError(
          "Não foi possível identificar o usuário autenticado.",
          401,
        );
      }

      const result = await this.usersBusiness.updateUserByAdmin(
        userId,
        request.params.id,
        request.body,
      );
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async updateSelf(
    request: FastifyRequest<{ Body: UpdateUserSelfDTO }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.authUser?.id_user;
      if (!userId) {
        throw new CustomError(
          "Não foi possível identificar o usuário autenticado.",
          401,
        );
      }

      const result = await this.usersBusiness.updateSelf(userId, request.body);
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async list(
    request: FastifyRequest<{ Querystring: ListUsersParams }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.usersBusiness.getUsersPaginated(request.query);
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async deleteAdmin(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.authUser?.id_user;
      if (!userId) {
        throw new CustomError(
          "Não foi possível identificar o usuário autenticado.",
          401,
        );
      }

      await this.usersBusiness.deleteUserByAdmin(userId, request.params.id);
      return reply.code(204).send();
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }
}
