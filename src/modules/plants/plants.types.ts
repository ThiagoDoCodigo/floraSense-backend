export enum PlantPhaseEnum {
  SEED = "SEED",
  GERMINATION = "GERMINATION",
  VEGETATIVE = "VEGETATIVE",
  FLOWERING = "FLOWERING",
  HARVEST = "HARVEST",
}

export enum EnvironmentTypeEnum {
  INDOOR = "INDOOR",
  OUTDOOR = "OUTDOOR",
  GREENHOUSE = "GREENHOUSE",
}

export enum SunlightExposureEnum {
  FULL_SUN = "FULL_SUN",
  PARTIAL_SHADE = "PARTIAL_SHADE",
  SHADOW = "SHADOW",
}

export enum SubstrateTypeEnum {
  SOIL = "SOIL",
  SANDY = "SANDY",
  COCO_PEAT = "COCO_PEAT",
  HYDROPONIC = "HYDROPONIC",
}

export type PaginatedResponse<T> = {
  data: T[];
  limit: number;
  page: number;
  totalPages: number;
  total: number;
};

export type CreatePlantDTO = {
  name: string;
  especie: string;
  phaseOfLife: PlantPhaseEnum;
  environmentType: EnvironmentTypeEnum;
  sunlightExposure: SunlightExposureEnum;
  substrateType: SubstrateTypeEnum;
  plantingDate?: Date;
  isConnected: boolean;
  macAddress: string | null;
  firmwareVersion: string | null;
  lastConnectionDate: Date | null;
  delayReading: number;
  imageUrl?: string | null;
};

export type UpdatePlantDTO = Partial<CreatePlantDTO>;

export type PlantResponseDTO = CreatePlantDTO & {
  id: string;
  userId: string;
  delayReading: number;
  imageUrl: string | null;
  created_at: Date;
  updated_at: Date;
  user?: {
    name: string;
    email: string;
  };
};

export type ListPlantsParams = {
  page: number;
  limit: number;
  name?: string;
  especie?: string;
  phaseOfLife?: string;
  userId?: string;
};

export type ConnectDeviceDTO = {
  macAddress: string;
  firmwareVersion?: string;
};

export type DashboardIndicatorsDTO = {
  totalPlants: number;
  plantsInAttention: number;
  averageSoilMoisture: number;
  averageTemperature: number;
};

export type UpdateIntervalDTO = {
  intervalMinutes: number;
};
