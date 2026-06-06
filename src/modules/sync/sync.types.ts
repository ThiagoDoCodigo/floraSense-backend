export type SyncDeltaParams = {
  lastSync?: string;
};

export type SyncDeltaResponseDTO = {
  plants: {
    updated: any[];
    deletedIds: string[];
  };
  readings: {
    updated: any[];
    deletedIds: string[];
  };
};
