import { FastifyRequest, FastifyReply } from "fastify";
import { AuthBusiness } from "./auth.business";
import { sendError } from "../../utils/errors/sendError";
import { LoginRequestDTO, RefreshTokenRequestDTO } from "./auth.types";

export class AuthController {
  private readonly authBusiness: AuthBusiness;

  constructor(authBusiness: AuthBusiness) {
    this.authBusiness = authBusiness;
  }

  public async login(
    request: FastifyRequest<{ Body: LoginRequestDTO }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.authBusiness.login(
        request.server,
        request.body,
      );
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }

  public async refreshToken(
    request: FastifyRequest<{ Body: RefreshTokenRequestDTO }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.authBusiness.refreshToken(
        request.server,
        request.body,
      );
      return reply.code(200).send(result);
    } catch (err: unknown) {
      return sendError(reply, err);
    }
  }
}
