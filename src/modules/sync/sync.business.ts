import { SyncService } from "./sync.service";
import { SyncDeltaParams, SyncDeltaResponseDTO } from "./sync.types";
import { handleSequelizeError } from "../../utils/errors/handleSequelizeError";

export class SyncBusiness {
  private syncService: SyncService;

  constructor(syncService: SyncService) {
    this.syncService = syncService;
  }

  public async processDeltaSync(
    userId: string,
    params: SyncDeltaParams,
  ): Promise<SyncDeltaResponseDTO> {
    try {
      return await this.syncService.getDelta(userId, params);
    } catch (err) {
      handleSequelizeError(err, "Sincronização Delta");
    }
  }
}
