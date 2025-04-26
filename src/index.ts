import { Vimeo } from "@vimeo/vimeo";
import { validateEnv } from "./config/env";
import { VimeoVideo, VimeoVideoFilters, VimeoVideoUpdate } from "./types/vimeo";

const env = validateEnv();
const vimeoClient = new Vimeo(
  env.VIMEO_CLIENT_ID,
  env.VIMEO_CLIENT_SECRET,
  env.VIMEO_ACCESS_TOKEN
);

export const getVideos = async (
  filters: VimeoVideoFilters = {}
): Promise<{
  total: number;
  page: number;
  per_page: number;
  paging: {
    next?: string;
    previous?: string;
    first: string;
    last: string;
  };
  data: VimeoVideo[];
}> => {
  try {
    const response = await new Promise((resolve, reject) => {
      vimeoClient.request(
        {
          method: "GET",
          path: "/me/videos",
          query: filters,
        },
        (err, body) => {
          if (err) reject(err);
          resolve(body);
        }
      );
    });
    return response as any;
  } catch (error) {
    console.error("❌ Error al obtener videos:", error);
    throw error;
  }
};

export const updateVideoPrivacy = async (
  videoId: string,
  update: VimeoVideoUpdate
): Promise<VimeoVideo> => {
  try {
    const response = await new Promise((resolve, reject) => {
      vimeoClient.request(
        {
          method: "PATCH",
          path: `/videos/${videoId}`,
          query: update,
        },
        (err, body) => {
          if (err) reject(err);
          resolve(body);
        }
      );
    });
    return response as VimeoVideo;
  } catch (error) {
    console.error("❌ Error al actualizar el video:", error);
    throw error;
  }
};

(async () => {
  console.log("🚀 Iniciando aplicación de integración Vimeo-WordPress");

  console.log("✅ Variables de entorno validadas correctamente");

  // Inicializar cliente de Vimeo

  console.log("✅ Cliente de Vimeo inicializado");

  try {
    const videos = await getVideos({
      per_page: 1,
      sort: "date",
      direction: "desc",
      filter_embeddable: true,
    });
    console.log("📹 Videos obtenidos:", videos);

    if (videos.data.length > 0) {
      const video = videos.data[0];
      const updatedVideo = await updateVideoPrivacy(
        video.uri.split("/").pop()!,
        {
          privacy: {
            view: "disable",
          },
        }
      );
      console.log("✅ Video actualizado:", updatedVideo);
    }
  } catch (error) {
    console.error("❌ Error en la aplicación:", error);
    process.exit(1);
  }
})();
// Aquí irá la lógica principal de la aplicación
