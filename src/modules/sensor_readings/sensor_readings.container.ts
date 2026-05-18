import { SensorReadingsService } from "./sensor_readings.service";
import { SensorReadingsBusiness } from "./sensor_readings.business";
import { SensorReadingsController } from "./sensor_readings.controller";
import { GeminiService } from "../../services/ai/gemini.service";

const geminiService = new GeminiService();
const readingsService = new SensorReadingsService();
const readingsBusiness = new SensorReadingsBusiness(
  readingsService,
  geminiService,
);
export const readingsController = new SensorReadingsController(
  readingsBusiness,
);
