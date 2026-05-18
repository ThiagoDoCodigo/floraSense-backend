import { EventEmitter } from "events";
import { SensorReadingResponseDTO } from "../../modules/sensor_readings/sensor_readings.types";

interface AppEvents {
  "reading:created": (data: {
    reading: SensorReadingResponseDTO;
    userId: string;
    plantId: string;
  }) => void;
}

class AppEventEmitter extends EventEmitter {
  public emit<K extends keyof AppEvents>(
    event: K,
    ...args: Parameters<AppEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  public on<K extends keyof AppEvents>(event: K, listener: AppEvents[K]): this {
    return super.on(event, listener);
  }
}

export const appEvents = new AppEventEmitter();
