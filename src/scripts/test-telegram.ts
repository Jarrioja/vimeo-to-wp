import { TelegramService } from "../services/telegram";
import { VimeoService } from "../services/vimeo";

async function testTelegramBot() {
  try {
    console.log("🤖 Iniciando prueba del bot de Telegram...");

    const telegram = new TelegramService();
    const vimeo = new VimeoService();

    // Obtener los últimos videos de Vimeo
    console.log("📹 Obteniendo últimos videos de Vimeo...");
    const latestVideos = await vimeo.getLatestVideos();
    if (!latestVideos || latestVideos.length === 0) {
      throw new Error("No se encontró ningún video en Vimeo");
    }

    // Seleccionar el primer video para la prueba
    const latestVideo = latestVideos[0];
    console.log("✅ Video encontrado:", latestVideo.name);

    // Probar mensaje simple
    console.log("📤 Enviando mensaje de prueba...");
    await telegram.sendSuccessMessage(
      "¡Hola! Esta es una prueba de conexión del bot 🎉"
    );

    // Probar botones de confirmación con el video real
    console.log("📤 Enviando mensaje con botones...");
    const respuesta = await telegram.askForPublishing(latestVideo.link);
    console.log("✅ Respuesta recibida:", respuesta ? "Sí" : "No");

    // Si respondió que sí, mostrar selección de entrenador
    if (respuesta) {
      console.log("📤 Mostrando selección de entrenador...");
      // Obtener el día actual (1-6, lunes-sábado)
      const today = new Date().getDay();
      const dayNumber = today === 0 ? 1 : today; // Si es domingo, usamos el día 1
      console.log("📅 Usando configuración del día:", dayNumber);

      const trainerImageUrl = await telegram.askForTrainer(dayNumber);
      console.log("✅ Imagen del entrenador seleccionada:", trainerImageUrl);
    }

    console.log("✅ Prueba completada exitosamente!");
  } catch (error) {
    console.error("❌ Error durante la prueba:", error);
  }
}

testTelegramBot();
