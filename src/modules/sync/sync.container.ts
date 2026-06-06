import { SyncService } from "./sync.service";
import { SyncBusiness } from "./sync.business";
import { SyncController } from "./sync.controller";

const syncService = new SyncService();
const syncBusiness = new SyncBusiness(syncService);
export const syncController = new SyncController(syncBusiness);
