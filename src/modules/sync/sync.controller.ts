import { FastifyRequest, FastifyReply } from "fastify";
import { SyncBusiness } from "./sync.business";
import { sendError } from "../../utils/errors/sendError";
import { SyncDeltaParams } from "./sync.types";

export class SyncController {
  private syncBusiness: SyncBusiness;

  constructor(syncBusiness: SyncBusiness) {
    this.syncBusiness = syncBusiness;
  }

  public async getDelta(
    request: FastifyRequest<{ Querystring: SyncDeltaParams }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.authUser?.id_user;
      if (!userId) throw new Error("Usuário não autenticado.");

      const result = await this.syncBusiness.processDeltaSync(
        userId,
        request.query,
      );
      return reply.code(200).send(result);
    } catch (err) {
      return sendError(reply, err);
    }
  }
}
