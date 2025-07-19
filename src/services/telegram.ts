import TelegramBot from "node-telegram-bot-api";
import { validateEnv } from "../config/env";
import { getACFOptionsConfig } from "./wordpress";
import { DayConfig, Trainer } from "../types/wordpress";
import { VimeoVideo } from "../types/vimeo";
import { WordPressPost } from "../types/wordpress";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = validateEnv();

export class TelegramService {
  private bot: TelegramBot;
  private chatId: string;
  private activeRequests: Set<string> = new Set();
  private requestTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    this.chatId = TELEGRAM_CHAT_ID;
  }

  // Método para verificar si un chat tiene permiso
  private isAuthorizedChat(chatId: number | string): boolean {
    return chatId.toString() === this.chatId;
  }

  // Método para limpiar solicitudes activas
  private cleanupRequest(requestId: string): void {
    this.activeRequests.delete(requestId);
    const timeout = this.requestTimeouts.get(requestId);
    if (timeout) {
      clearTimeout(timeout);
      this.requestTimeouts.delete(requestId);
    }
  }

  // Método para verificar si hay una solicitud activa
  private isRequestActive(requestId: string): boolean {
    return this.activeRequests.has(requestId);
  }

  // Método para manejar comandos
  public onCommand(
    command: string,
    handler: (msg: TelegramBot.Message) => void
  ) {
    this.bot.onText(new RegExp(`^\\/${command}$`), async (msg) => {
      try {
        if (!this.isAuthorizedChat(msg.chat.id)) {
          await this.bot.sendMessage(
            msg.chat.id,
            "Lo siento, no tienes permiso para usar este comando."
          );
          return;
        }
        await handler(msg);
      } catch (error) {
        console.error(`Error al manejar comando /${command}:`, error);
      }
    });
  }

  public async sendMessage(text: string): Promise<void> {
    await this.bot.sendMessage(this.chatId, text);
  }

  async askForVideoSelection(videos: VimeoVideo[]): Promise<VimeoVideo | null> {
    const requestId = `video_selection_${Date.now()}`;

    // Verificar si ya hay una solicitud activa
    if (this.isRequestActive("video_selection")) {
      await this.sendMessage(
        "⚠️ Ya hay una selección de video en progreso. Por favor, completa esa primero."
      );
      return null;
    }

    this.activeRequests.add("video_selection");

    const message = "Selecciona el video que quieres publicar:";

    // Crear botones con los títulos de los videos
    const keyboard = videos.map((video, index) => [
      {
        text: video.name,
        callback_data: `${requestId}_video_${index}`,
      },
    ]);

    // Agregar botón de cancelar
    keyboard.push([
      { text: "❌ Cancelar", callback_data: `${requestId}_cancel` },
    ]);

    const opts = {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    };

    await this.bot.sendMessage(this.chatId, message, opts);

    return new Promise((resolve) => {
      // Configurar timeout de 2 horas (7200000 ms)
      const timeout = setTimeout(() => {
        this.cleanupRequest("video_selection");
        this.sendMessage(
          "⏰ Tiempo de espera agotado. La selección de video ha sido cancelada."
        );
        resolve(null);
      }, 7200000);

      this.requestTimeouts.set(requestId, timeout);

      const callbackHandler = (query: any) => {
        // Verificar que la respuesta corresponde a esta solicitud
        if (!query.data?.startsWith(requestId)) {
          return;
        }

        this.bot.answerCallbackQuery(query.id);
        this.cleanupRequest("video_selection");

        if (query.data === `${requestId}_cancel`) {
          resolve(null);
          return;
        }

        if (query.data?.startsWith(`${requestId}_video_`)) {
          const index = parseInt(query.data.split("_")[2]);
          resolve(videos[index]);
          return;
        }

        resolve(null);
      };

      this.bot.once("callback_query", callbackHandler);
    });
  }

  async askForPublishing(videoUrl: string): Promise<boolean> {
    const requestId = `publishing_${Date.now()}`;

    // Verificar si ya hay una solicitud activa
    if (this.isRequestActive("publishing")) {
      await this.sendMessage(
        "⚠️ Ya hay una confirmación de publicación en progreso. Por favor, completa esa primero."
      );
      return false;
    }

    this.activeRequests.add("publishing");

    const message = `¿Quieres publicar la clase de hoy?\n\nVideo: ${videoUrl}`;
    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Sí", callback_data: `${requestId}_yes` },
            { text: "No", callback_data: `${requestId}_no` },
          ],
        ],
      },
    };

    await this.bot.sendMessage(this.chatId, message, opts);

    return new Promise((resolve) => {
      // Configurar timeout de 2 horas (7200000 ms)
      const timeout = setTimeout(() => {
        this.cleanupRequest("publishing");
        this.sendMessage(
          "⏰ Tiempo de espera agotado. La confirmación de publicación ha sido cancelada."
        );
        resolve(false);
      }, 7200000);

      this.requestTimeouts.set(requestId, timeout);

      const callbackHandler = (query: any) => {
        // Verificar que la respuesta corresponde a esta solicitud
        if (!query.data?.startsWith(requestId)) {
          return;
        }

        this.bot.answerCallbackQuery(query.id);
        this.cleanupRequest("publishing");

        if (query.data === `${requestId}_yes`) {
          resolve(true);
          return;
        }

        if (query.data === `${requestId}_no`) {
          resolve(false);
          return;
        }

        resolve(false);
      };

      this.bot.once("callback_query", callbackHandler);
    });
  }

  private formatTrainerName(trainer: string | Trainer): string {
    if (typeof trainer === "string") return trainer;
    return trainer.name;
  }

  async askForPostSelection(
    posts: WordPressPost[]
  ): Promise<WordPressPost | null> {
    const requestId = `post_selection_${Date.now()}`;

    // Verificar si ya hay una solicitud activa
    if (this.isRequestActive("post_selection")) {
      await this.sendMessage(
        "⚠️ Ya hay una selección de post en progreso. Por favor, completa esa primero."
      );
      return null;
    }

    this.activeRequests.add("post_selection");

    const message = "Selecciona el post que quieres eliminar:";

    // Crear botones con los títulos de los posts
    const keyboard = posts.map((post, index) => [
      {
        text: `${post.title?.rendered || "Sin título"} (${new Date(
          post.date || new Date()
        ).toLocaleDateString()})`,
        callback_data: `${requestId}_post_${index}`,
      },
    ]);

    // Agregar botón de cancelar
    keyboard.push([
      { text: "❌ Cancelar", callback_data: `${requestId}_cancel` },
    ]);

    const opts = {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    };

    await this.bot.sendMessage(this.chatId, message, opts);

    return new Promise((resolve) => {
      // Configurar timeout de 2 horas (7200000 ms)
      const timeout = setTimeout(() => {
        this.cleanupRequest("post_selection");
        this.sendMessage(
          "⏰ Tiempo de espera agotado. La selección de post ha sido cancelada."
        );
        resolve(null);
      }, 7200000);

      this.requestTimeouts.set(requestId, timeout);

      const callbackHandler = (query: any) => {
        // Verificar que la respuesta corresponde a esta solicitud
        if (!query.data?.startsWith(requestId)) {
          return;
        }

        this.bot.answerCallbackQuery(query.id);
        this.cleanupRequest("post_selection");

        if (query.data === `${requestId}_cancel`) {
          resolve(null);
          return;
        }

        if (query.data?.startsWith(`${requestId}_post_`)) {
          const index = parseInt(query.data.split("_")[2]);
          resolve(posts[index]);
          return;
        }

        resolve(null);
      };

      this.bot.once("callback_query", callbackHandler);
    });
  }

  async askForTrainer(dayNumber: number): Promise<string> {
    const requestId = `trainer_${Date.now()}`;

    // Verificar si ya hay una solicitud activa
    if (this.isRequestActive("trainer")) {
      await this.sendMessage(
        "⚠️ Ya hay una selección de entrenador en progreso. Por favor, completa esa primero."
      );
      throw new Error("Solicitud de entrenador duplicada");
    }

    this.activeRequests.add("trainer");

    const config = await getACFOptionsConfig();
    if (!config) {
      throw new Error("No se pudo obtener la configuración de WordPress");
    }

    const configKey = `config_day_${dayNumber}` as keyof typeof config;
    const dayConfig = config[configKey] as DayConfig;

    if (!dayConfig || !dayConfig.trainers) {
      throw new Error(
        `No hay entrenadores configurados para el día ${dayNumber}`
      );
    }

    // Mapeo de trainers a nombres
    const trainerNames = {
      trainer_1: "Janettsy",
      trainer_2: "Rafael",
      trainer_3: "Sandry",
    };

    // Crear array de trainers desde el objeto
    const keyboard = Object.entries(trainerNames).map(([key, name]) => [
      {
        text: name,
        callback_data: `${requestId}_${key}`,
      },
    ]);

    await this.bot.sendMessage(
      this.chatId,
      "Selecciona el entrenador para usar su imagen:",
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }
    );

    return new Promise((resolve, reject) => {
      // Configurar timeout de 2 horas (7200000 ms)
      const timeout = setTimeout(() => {
        this.cleanupRequest("trainer");
        this.sendMessage(
          "⏰ Tiempo de espera agotado. La selección de entrenador ha sido cancelada."
        );
        reject(new Error("Tiempo de espera agotado"));
      }, 7200000);

      this.requestTimeouts.set(requestId, timeout);

      const callbackHandler = async (query: any) => {
        // Verificar que la respuesta corresponde a esta solicitud
        if (!query.data?.startsWith(requestId)) {
          return;
        }

        await this.bot.answerCallbackQuery(query.id);
        this.cleanupRequest("trainer");

        if (!query.data) {
          reject(new Error("No se recibió respuesta válida"));
          return;
        }

        const trainerKey = query.data.replace(`${requestId}_`, "");
        const trainer =
          dayConfig.trainers[trainerKey as keyof typeof dayConfig.trainers];

        if (!trainer) {
          reject(new Error(`No se encontró el entrenador ${trainerKey}`));
          return;
        }

        // Usar image_1 como imagen principal
        const imageId = trainer.image_1;

        if (!imageId) {
          reject(
            new Error(
              `No hay imagen configurada para ${
                trainerNames[trainerKey as keyof typeof trainerNames]
              }`
            )
          );
          return;
        }

        resolve(imageId.toString());
      };

      this.bot.once("callback_query", callbackHandler);
    });
  }

  async sendSuccessMessage(postUrl: string): Promise<void> {
    const message = `¡Clase publicada exitosamente!\n\nPuedes verla aquí: ${postUrl}`;
    await this.bot.sendMessage(this.chatId, message);
  }

  async sendErrorMessage(error: string): Promise<void> {
    const message = `Error al publicar la clase:\n${error}`;
    await this.bot.sendMessage(this.chatId, message);
  }
}
