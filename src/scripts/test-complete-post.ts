import { VimeoService } from "../services/vimeo";
import { TelegramService } from "../services/telegram";
import { publishVideoToWordPress } from "../use-cases/publish-video-to-wordpress";

async function testCompletePost() {
  try {
    console.log("🚀 Iniciando prueba de publicación completa...");

    const vimeo = new VimeoService();
    const telegram = new TelegramService();

    // Obtener el último video de Vimeo
    console.log("📹 Obteniendo último video de Vimeo...");
    const latestVideo = await vimeo.getLatestVideo();
    if (!latestVideo) {
      throw new Error("No se encontró ningún video en Vimeo");
    }
    console.log("✅ Video encontrado:", latestVideo.name);

    // Preguntar si quiere publicar
    console.log("📤 Enviando mensaje de confirmación...");
    const shouldPublish = await telegram.askForPublishing(latestVideo.link);
    if (!shouldPublish) {
      console.log("❌ Publicación cancelada por el usuario");
      return;
    }

    // Obtener el día actual
    const today = new Date().getDay();
    const dayNumber = today === 0 ? 1 : today; // Si es domingo, usamos el día 1
    console.log("📅 Usando configuración del día:", dayNumber);

    // Obtener imagen del entrenador
    console.log("👤 Solicitando selección de entrenador...");
    const thumbnailUrl = await telegram.askForTrainer(dayNumber);
    console.log("✅ Imagen seleccionada:", thumbnailUrl);

    // Publicar el post
    console.log("📝 Publicando post...");
    const post = await publishVideoToWordPress({
      videoId: latestVideo.uri.split("/").pop()!,
      dayNumber,
      thumbnailUrl,
      forcePublish: true,
    });

    console.log("🎉 Post publicado exitosamente!");
    console.log("🌐 URL del post:", post.link);
  } catch (error) {
    console.error("❌ Error durante la prueba:", error);
  }
}

testCompletePost();
