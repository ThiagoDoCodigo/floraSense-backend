import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import fastifySocketIO from "fastify-socket.io";
import { Server, Socket } from "socket.io";
import { appEvents } from "../events/appEventEmitter";
import { Plant } from "../../modules/plants/models/plant.model";

declare module "fastify" {
  interface FastifyInstance {
    io: Server;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  // 1. Registra o Socket.io no Fastify
  await fastify.register(fastifySocketIO, {
    cors: { origin: "*" },
  });

  // 2. Middleware de Autenticação do Socket
  fastify.io.use((socket: Socket, next: (err?: Error) => void) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Autenticação WebSocket negada: Token ausente."));
    }

    try {
      // Usamos o verificador nativo do fastify.jwt
      const decoded = fastify.jwt.verify(token) as any;

      socket.data.user = { id: decoded.id_user, role: decoded.role };
      next();
    } catch (err: any) {
      console.log("[WS Auth Error]:", err.message);
      return next(new Error("Autenticação WebSocket negada: Token inválido."));
    }
  });

  // 3. Gerenciamento de Conexões e Salas
  fastify.io.on("connection", (socket: Socket) => {
    const userId = socket.data.user.id;

    // A: Coloca o usuário na sua sala pessoal
    socket.join(`user_${userId}`);
    console.log(`🔌 Usuário conectado ao WS: ${userId}`);

    // B: Escuta quando o App entra na tela de Detalhes da Planta
    socket.on("join_plant", async (payload: { plantId: string }) => {
      try {
        const plant = await Plant.findByPk(payload.plantId);

        // VALIDAÇÃO DE POSSE
        if (
          !plant ||
          (plant.userId !== userId && socket.data.user.role !== "ADMIN")
        ) {
          socket.emit("error", { message: "Acesso negado a esta planta." });
          return;
        }

        socket.join(`plant_${payload.plantId}`);
        socket.emit("joined_plant", { plantId: payload.plantId });
      } catch (error) {
        socket.emit("error", { message: "Falha ao acessar sala da planta." });
      }
    });

    // C: Escuta quando o App sai da tela de Detalhes
    socket.on("leave_plant", (payload: { plantId: string }) => {
      socket.leave(`plant_${payload.plantId}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Usuário desconectado do WS: ${userId}`);
    });
  });

  // =================================================================
  // 4. A PONTE: Escutando os eventos do Backend e enviando pro App
  // =================================================================
  appEvents.on("reading:created", ({ reading, userId, plantId }) => {
    // A: Atualiza a lista de quem está com a tela da planta ABERTA
    fastify.io.to(`plant_${plantId}`).emit("new_sensor_reading", reading);

    // B: Se for urgente, manda notificação E O OBJETO COMPLETO para o dono da planta
    if (reading.isUrgent) {
      fastify.io.to(`user_${userId}`).emit("urgent_alert", {
        // Campos para a Notificação Push nativa do celular
        title: "Atenção necessária!",
        message: `A IA detectou um risco e requer sua atenção.`,
        readingId: reading.id,
        // Espalha TODOS os dados da leitura (...reading) para montar o Card no Frontend!
        ...reading,
      });
    }
  });
});
