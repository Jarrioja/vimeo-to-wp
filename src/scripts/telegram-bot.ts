import cron from "node-cron";
import { TelegramService } from "../services/telegram";
import { VimeoService } from "../services/vimeo";
import { publishVideoToWordPress } from "../use-cases/publish-video-to-wordpress";
import { getLatestPosts, deletePost } from "../services/wordpress";

const telegram = new TelegramService();
const vimeo = new VimeoService();

async function publishLatestVideo() {
  try {
    // Get latest videos from Vimeo
    const message = "📹 Obteniendo últimos videos de Vimeo...";
    console.log(message);
    await telegram.sendMessage(message);

    const latestVideos = await vimeo.getLatestVideos();
    if (!latestVideos || latestVideos.length === 0) {
      await telegram.sendErrorMessage("No se encontró ningún video en Vimeo");
      return;
    }

    const foundMessage = `✅ Se encontraron ${latestVideos.length} videos`;
    console.log(foundMessage);
    await telegram.sendMessage(foundMessage);

    // Ask user to select a video
    const selectedVideo = await telegram.askForVideoSelection(latestVideos);
    if (!selectedVideo) {
      const cancelMessage = "❌ Selección de video cancelada por el usuario";
      console.log(cancelMessage);
      await telegram.sendMessage(cancelMessage);
      return;
    }

    const videoSelectedMessage = `✅ Video seleccionado: ${selectedVideo.name}`;
    console.log(videoSelectedMessage);
    await telegram.sendMessage(videoSelectedMessage);

    // Get current day number (1-6, Monday-Saturday)
    const today = new Date().getDay();
    const dayNumber = today === 0 ? 1 : today; // Si es domingo, usamos configuración del lunes

    // Ask if user wants to publish
    const shouldPublish = await telegram.askForPublishing(selectedVideo.link);
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
      videoId: selectedVideo.uri.split("/").pop()!,
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

async function deleteLatestPost() {
  try {
    // Get latest posts from WordPress
    const message = "📝 Obteniendo últimos posts de WordPress...";
    console.log(message);
    await telegram.sendMessage(message);

    const latestPosts = await getLatestPosts(5);
    if (!latestPosts || latestPosts.length === 0) {
      await telegram.sendErrorMessage(
        "No se encontró ningún post en WordPress"
      );
      return;
    }

    const foundMessage = `✅ Se encontraron ${latestPosts.length} posts`;
    console.log(foundMessage);
    await telegram.sendMessage(foundMessage);

    // Ask user to select a post to delete
    const selectedPost = await telegram.askForPostSelection(latestPosts);
    if (!selectedPost) {
      const cancelMessage = "❌ Selección de post cancelada por el usuario";
      console.log(cancelMessage);
      await telegram.sendMessage(cancelMessage);
      return;
    }

    const postSelectedMessage = `✅ Post seleccionado: ${
      selectedPost.title?.rendered || "Sin título"
    }`;
    console.log(postSelectedMessage);
    await telegram.sendMessage(postSelectedMessage);

    // Ask for confirmation to delete
    const shouldDelete = await telegram.askForPublishing(
      `¿Eliminar el post "${selectedPost.title?.rendered || "Sin título"}"?`
    );
    if (!shouldDelete) {
      const cancelMessage = "❌ Eliminación cancelada por el usuario";
      console.log(cancelMessage);
      await telegram.sendMessage(cancelMessage);
      return;
    }

    // Delete the post
    const deleteMessage = "🗑️ Eliminando post...";
    console.log(deleteMessage);
    await telegram.sendMessage(deleteMessage);

    if (!selectedPost.id) {
      throw new Error("El post seleccionado no tiene un ID válido");
    }

    await deletePost(selectedPost.id);

    // Send success message
    const successMessage = `🎉 Post eliminado exitosamente!\n📝 Título: ${
      selectedPost.title?.rendered || "Sin título"
    }`;
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
    "¡Hola! 👋 Soy el bot de publicación de clases.\n\n" +
      "Comandos disponibles:\n" +
      "📝 /publicar - Selecciona y publica una clase de Vimeo\n" +
      "🗑️ /eliminar - Selecciona y elimina un post de WordPress"
  );
});

telegram.onCommand("publicar", async () => {
  await publishLatestVideo();
});

telegram.onCommand("eliminar", async () => {
  await deleteLatestPost();
});

// Schedule tasks for Uruguay timezone
// Lunes a viernes: 9:30 AM y 12:00 PM
cron.schedule("30 9,12 * * 1-5", publishLatestVideo, {
  timezone: "America/Montevideo",
});

// Sábados: 12:30 PM
cron.schedule("30 12 * * 6", publishLatestVideo, {
  timezone: "America/Montevideo",
});

console.log(
  "🤖 Bot de Telegram iniciado\n" +
    "📅 Horarios programados (hora Uruguay):\n" +
    "   Lunes a viernes: 9:30 AM y 12:00 PM\n" +
    "   Sábados: 12:30 PM\n" +
    "   Domingos: Sin notificaciones\n" +
    "💡 Comandos disponibles:\n" +
    "   /start    - Muestra mensaje de bienvenida\n" +
    "   /publicar - Selecciona y publica una clase de Vimeo\n" +
    "   /eliminar - Selecciona y elimina un post de WordPress"
);
