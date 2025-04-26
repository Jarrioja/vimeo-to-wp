import cron from "node-cron";
import { TelegramService } from "../services/telegram";
import { VimeoService } from "../services/vimeo";
import { publishVideoToWordPress } from "../use-cases/publish-video-to-wordpress";

const telegram = new TelegramService();
const vimeo = new VimeoService();

async function publishLatestVideo() {
  try {
    // Get latest video from Vimeo
    const message = "📹 Obteniendo último video de Vimeo...";
    console.log(message);
    await telegram.sendMessage(message);

    const latestVideo = await vimeo.getLatestVideo();
    if (!latestVideo) {
      await telegram.sendErrorMessage("No se encontró ningún video en Vimeo");
      return;
    }

    const foundMessage = `✅ Video encontrado: ${latestVideo.name}`;
    console.log(foundMessage);
    await telegram.sendMessage(foundMessage);

    // Get current day number (1-6, Monday-Saturday)
    const today = new Date().getDay();
    const dayNumber = today === 0 ? 1 : today; // Si es domingo, usamos configuración del lunes

    // Ask if user wants to publish
    const shouldPublish = await telegram.askForPublishing(latestVideo.link);
    if (!shouldPublish) {
      const cancelMessage = "❌ Publicación cancelada por el usuario";
      console.log(cancelMessage);
      await telegram.sendMessage(cancelMessage);
      return;
    }

    // Ask for trainer selection
    const trainerMessage = "👤 Solicitando selección de entrenador...";
    console.log(trainerMessage);
    await telegram.sendMessage(trainerMessage);

    const thumbnailUrl = await telegram.askForTrainer(dayNumber);

    const imageMessage = "✅ Imagen seleccionada";
    console.log(imageMessage);
    await telegram.sendMessage(imageMessage);

    // Publish video
    const publishMessage = "📝 Publicando post...";
    console.log(publishMessage);
    await telegram.sendMessage(publishMessage);

    const result = await publishVideoToWordPress({
      videoId: latestVideo.uri.split("/").pop()!,
      dayNumber,
      thumbnailUrl,
      forcePublish: true,
    });

    // Send success message with post URL
    const successMessage = `🎉 Post publicado exitosamente!\n🌐 URL: ${result.link}`;
    await telegram.sendSuccessMessage(successMessage);
  } catch (error) {
    await telegram.sendErrorMessage(
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
}

// Inicializar comandos del bot
telegram.onCommand("start", async () => {
  await telegram.sendMessage(
    "¡Hola! 👋 Soy el bot de publicación de clases. Usa /publicar para publicar la última clase de Vimeo."
  );
});

telegram.onCommand("publicar", async () => {
  await publishLatestVideo();
});

// Schedule tasks for 7:30 AM and 11:30 AM Miami time (UTC-4)
cron.schedule("30 11,15 * * *", publishLatestVideo, {
  timezone: "America/New_York",
});

console.log(
  "🤖 Bot de Telegram iniciado\n" +
    "📅 Horarios programados: 7:30 AM y 11:30 AM (hora Miami)\n" +
    "💡 Comandos disponibles:\n" +
    "   /start   - Muestra mensaje de bienvenida\n" +
    "   /publicar - Publica la última clase de Vimeo"
);
