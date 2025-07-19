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

  constructor() {
    this.bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    this.chatId = TELEGRAM_CHAT_ID;
  }

  // Método para verificar si un chat tiene permiso
  private isAuthorizedChat(chatId: number | string): boolean {
    return chatId.toString() === this.chatId;
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
    const message = "Selecciona el video que quieres publicar:";

    // Crear botones con los títulos de los videos
    const keyboard = videos.map((video, index) => [
      {
        text: video.name,
        callback_data: `video_${index}`,
      },
    ]);

    // Agregar botón de cancelar
    keyboard.push([{ text: "❌ Cancelar", callback_data: "cancel" }]);

    const opts = {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    };

    await this.bot.sendMessage(this.chatId, message, opts);

    return new Promise((resolve) => {
      this.bot.once("callback_query", (query) => {
        this.bot.answerCallbackQuery(query.id);

        if (query.data === "cancel") {
          resolve(null);
          return;
        }

        if (query.data?.startsWith("video_")) {
          const index = parseInt(query.data.split("_")[1]);
          resolve(videos[index]);
          return;
        }

        resolve(null);
      });
    });
  }

  async askForPublishing(videoUrl: string): Promise<boolean> {
    const message = `¿Quieres publicar la clase de hoy?\n\nVideo: ${videoUrl}`;
    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Sí", callback_data: "yes" },
            { text: "No", callback_data: "no" },
          ],
        ],
      },
    };

    await this.bot.sendMessage(this.chatId, message, opts);

    return new Promise((resolve) => {
      this.bot.once("callback_query", (query) => {
        this.bot.answerCallbackQuery(query.id);
        resolve(query.data === "yes");
      });
    });
  }

  async askForPostSelection(
    posts: WordPressPost[]
  ): Promise<WordPressPost | null> {
    const message = "Selecciona el post que quieres eliminar:";

    // Crear botones con los títulos de los posts
    const keyboard = posts.map((post, index) => [
      {
        text: `${post.title?.rendered || "Sin título"} (${new Date(
          post.date || new Date()
        ).toLocaleDateString()})`,
        callback_data: `post_${index}`,
      },
    ]);

    // Agregar botón de cancelar
    keyboard.push([{ text: "❌ Cancelar", callback_data: "cancel" }]);

    const opts = {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    };

    await this.bot.sendMessage(this.chatId, message, opts);

    return new Promise((resolve) => {
      this.bot.once("callback_query", (query) => {
        this.bot.answerCallbackQuery(query.id);

        if (query.data === "cancel") {
          resolve(null);
          return;
        }

        if (query.data?.startsWith("post_")) {
          const index = parseInt(query.data.split("_")[1]);
          resolve(posts[index]);
          return;
        }

        resolve(null);
      });
    });
  }

  private formatTrainerName(trainer: string | Trainer): string {
    if (typeof trainer === "string") return trainer;
    return trainer.name;
  }

  async askForTrainer(dayNumber: number): Promise<string> {
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
        callback_data: key,
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
      this.bot.once("callback_query", async (query) => {
        await this.bot.answerCallbackQuery(query.id);
        if (!query.data) {
          reject(new Error("No se recibió respuesta válida"));
          return;
        }

        const trainerKey = query.data;
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
      });
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
