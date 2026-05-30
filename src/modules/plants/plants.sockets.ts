import type { WebSocket } from "ws";

class PlantSocketManager {
  private activeSockets = new Map<string, WebSocket>();

  public registerSocket(plantId: string, socket: WebSocket): void {
    const oldSocket = this.activeSockets.get(plantId);
    if (oldSocket) {
      try {
        oldSocket.close();
      } catch (e) {}
    }
    this.activeSockets.set(plantId, socket);
    console.log(`[WS] ESP32 Online - Planta: ${plantId}`);
  }

  public removeSocket(plantId: string): void {
    this.activeSockets.delete(plantId);
    console.log(`[WS] ESP32 Offline - Planta: ${plantId}`);
  }

  public sendCommand(plantId: string, payload: object): boolean {
    const socket = this.activeSockets.get(plantId);

    if (!socket || socket.readyState !== socket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify(payload));
    return true;
  }
}

export const plantSocketManager = new PlantSocketManager();
