import { VimeoService } from "../services/vimeo";
import {
  createPost,
  publishPost,
  getACFOptionsConfig,
  uploadMediaFromUrl,
} from "../services/wordpress";
import { VimeoVideo } from "../types/vimeo";
import { VimeoWPConfig } from "../types/wordpress";

export interface PublishVideoOptions {
  videoId: string;
  dayNumber?: number;
  thumbnailUrl?: string; // ID de la imagen en WordPress
  forcePublish?: boolean;
}

export async function publishVideoToWordPress(options: PublishVideoOptions) {
  try {
    // Determinar el día
    const today = new Date().getDay(); // 0 = domingo, 1-6 = lunes-sábado
    const dayNumber = options.dayNumber || today;

    // Validar el día
    if (dayNumber === 0 || dayNumber === 7) {
      throw new Error("No se pueden publicar videos los domingos");
    }

    if (dayNumber < 1 || dayNumber > 6) {
      throw new Error("El número de día debe estar entre 1 y 6");
    }

    console.log("🚀 Iniciando publicación de video a WordPress...");

    // Inicializar servicios
    const vimeoService = new VimeoService();

    // Obtener configuración de WordPress
    console.log("📋 Obteniendo configuración de WordPress...");
    const wpConfig = await getACFOptionsConfig();

    if (!wpConfig) {
      throw new Error("No se pudo obtener la configuración de WordPress");
    }

    // Validar que la configuración existe y tiene la estructura esperada
    const configKey = `config_day_${dayNumber}` as keyof VimeoWPConfig;
    const dayConfig = wpConfig[configKey];

    if (!dayConfig) {
      throw new Error(
        `No se encontró configuración para el día ${dayNumber}. Verifica la configuración en ACF.`
      );
    }

    if (!dayConfig.category) {
      throw new Error(
        `La configuración del día ${dayNumber} no tiene una categoría asignada. Verifica la configuración en ACF.`
      );
    }

    // Obtener el video
    let video: VimeoVideo;
    if (options.videoId) {
      console.log("📹 Obteniendo video específico...");
      video = await vimeoService.getVideoById(options.videoId);
    } else {
      console.log("📹 Obteniendo último video de Vimeo...");
      const videos = await vimeoService.getVideos({
        per_page: 1,
        sort: "date",
        direction: "desc",
      });

      if (videos.data.length === 0) {
        throw new Error("No se encontraron videos en Vimeo");
      }

      video = videos.data[0];
    }

    console.log("✅ Video encontrado:", video.name);

    // Configurar privacidad del video
    console.log("🔒 Configurando privacidad del video...");
    await vimeoService.setVideoEmbedOnly(video.uri.split("/").pop()!);
    console.log("✅ Privacidad configurada");

    // Ya no necesitamos obtener la categoría por separado ya que viene en la config
    const categoryId = dayConfig.category.term_id;
    const categoryName = dayConfig.category.name;

    // Formatear título
    const formattedTitle = await formatVideoTitle(categoryName, dayNumber);

    // Crear el post en WordPress
    console.log("📝 Creando post en WordPress...");
    const post = await createPost({
      title: formattedTitle,
      content: `
        <div class="video-container">
          ${video.embed.html}
        </div>
        <p>${video.description || ""}</p>
      `,
      status: options.forcePublish ? "publish" : "draft",
      categoria_de_clase_grabada: [categoryId],
      featured_media: options.thumbnailUrl
        ? parseInt(options.thumbnailUrl)
        : undefined,
      acf: {
        video_id: video.uri.split("/").pop() || "",
        video_url: video.link,
        video_duration: video.duration,
        day_number: dayNumber,
        trainers: Object.keys(dayConfig.trainers).join(", "),
      },
    });

    console.log("✅ Post creado:", post.id);

    if (!options.forcePublish) {
      console.log("💾 Post guardado como borrador:", post.link);
    } else {
      console.log("🌐 Post publicado:", post.link);
    }

    console.log("\n📋 Resumen de la publicación:");
    console.log("--------------------------------");
    console.log("ID:", post.id);
    console.log("Título:", formattedTitle);
    console.log("Categoría:", categoryName);
    console.log("Estado:", options.forcePublish ? "Publicado" : "Borrador");
    console.log("URL:", post.link);
    console.log("--------------------------------\n");

    console.log("🎉 Proceso completado exitosamente!");
    return post;
  } catch (error) {
    console.error("❌ Error en el proceso:", error);
    throw error;
  }
}

async function formatVideoTitle(
  categoryName: string,
  dayNumber: number
): Promise<string> {
  // Obtener la fecha actual
  const date = new Date();

  // Formatear la fecha
  const day = date.getDate();
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${categoryName} - ${day} de ${month} ${year}`;
}
