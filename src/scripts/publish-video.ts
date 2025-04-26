import { publishVideoToWordPress } from "../use-cases/publish-video-to-wordpress";

// Obtener argumentos de la línea de comandos
const dayArg = process.argv[2];
const videoId = process.argv[3];

// Si se proporciona un día, validarlo
let dayNumber: number | undefined;
if (dayArg) {
  dayNumber = parseInt(dayArg);
  if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 6) {
    console.error("❌ Por favor especifica un número de día válido (1-6)");
    process.exit(1);
  }
}

async function testPublishVideo() {
  try {
    console.log(
      `📅 Publicando video${videoId ? ` (ID: ${videoId})` : ""}${
        dayNumber ? ` para el día ${dayNumber}` : " para hoy"
      }...`
    );

    await publishVideoToWordPress({
      dayNumber,
      videoId,
      forcePublish: true,
    });
  } catch (error) {
    console.error("❌ Error en el test:", error);
    process.exit(1);
  }
}

// Ejecutar el test
testPublishVideo();
