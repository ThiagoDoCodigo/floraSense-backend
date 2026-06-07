export type PaginatedResponse<T> = {
  data: T[];
  limit: number;
  page: number;
  totalPages: number;
  total: number;
};

export type CreateSensorReadingDTO = {
  userId: string;
  plantId: string;
  macAddress: string;
  soilMoisture: number;
  temperature: number;
  airHumidity: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
};

export type SensorReadingResponseDTO = Omit<
  CreateSensorReadingDTO,
  "userId" | "macAddress"
> & {
  id: string;
  aiDiagnosis: string;
  actionRecommended: string;
  isUrgent: boolean;
  levelUrgent: LevelUrgentEnum | null;
  isRead: boolean;
  parametersIdeas: string | null;
  created_at: Date;
  plant?: {
    id: string;
    name: string;
    especie: string;
  };
};

export type ListSensorReadingsParams = {
  page: number;
  limit: number;
};

export enum LevelUrgentEnum {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export type ListUrgentReadingsParams = {
  page: number;
  limit: number;
  plantId?: string;
  levelUrgent?: LevelUrgentEnum;
};
