import {
  VimeoWPConfig,
  DayConfig,
  WordPressPost,
  CreatePostData,
  UpdatePostData,
} from "../types/wordpress";
import { validateEnv } from "../config/env";

const {
  WORDPRESS_ACF_OPTIONS_SLUG,
  WORDPRESS_URL,
  WORDPRESS_USERNAME,
  WORDPRESS_PASSWORD,
  WORDPRESS_CPT,
} = validateEnv();

// Basic auth credentials
const authHeader = Buffer.from(
  `${WORDPRESS_USERNAME}:${WORDPRESS_PASSWORD}`
).toString("base64");

// Por defecto 'options', o el slug de tu subpágina de opciones
const DEFAULT_ACF_OPTIONS_SLUG = WORDPRESS_ACF_OPTIONS_SLUG;

export async function getACFOptionsConfig(
  slug: string = DEFAULT_ACF_OPTIONS_SLUG
): Promise<VimeoWPConfig> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/acf/v3/options/${slug}`,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.acf) {
      throw new Error("La respuesta de ACF no tiene el formato esperado");
    }

    return data.acf as VimeoWPConfig;
  } catch (error) {
    console.error("❌ Error fetching ACF options config:", error);
    throw error;
  }
}

export async function getDayConfig(
  dayNumber: number,
  slug: string = DEFAULT_ACF_OPTIONS_SLUG
): Promise<DayConfig | null> {
  try {
    const config = await getACFOptionsConfig(slug);
    const dayKey = `config_day_${dayNumber}` as keyof VimeoWPConfig;
    return config[dayKey] || null;
  } catch (error) {
    console.error(`❌ Error getting config for day ${dayNumber}:`, error);
    throw error;
  }
}

// Función de prueba para verificar la conexión
export async function testWordPressConnection(): Promise<void> {
  try {
    console.log("🔍 Probando conexión con WordPress...");
    const config = await getACFOptionsConfig();
    console.log("✅ Conexión exitosa!");
    console.log("📝 Configuración obtenida:", JSON.stringify(config, null, 2));
  } catch (error) {
    console.error("❌ Error en la conexión:", error);
    throw error;
  }
}

export async function createPost(data: CreatePostData): Promise<WordPressPost> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/${WORDPRESS_CPT}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, type: WORDPRESS_CPT }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error al crear el post:", error);
    throw error;
  }
}

export async function updatePost(data: UpdatePostData): Promise<WordPressPost> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/${WORDPRESS_CPT}/${data.id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, type: WORDPRESS_CPT }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error al actualizar el post:", error);
    throw error;
  }
}

export async function publishPost(postId: number): Promise<WordPressPost> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/${WORDPRESS_CPT}/${postId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "publish",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error al publicar el post:", error);
    throw error;
  }
}

export async function getPost(postId: number): Promise<WordPressPost> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/${WORDPRESS_CPT}/${postId}`,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error al obtener el post:", error);
    throw error;
  }
}

export async function getCategory(categoryId: number): Promise<{
  id: number;
  name: string;
  slug: string;
}> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/categories/${categoryId}`,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error al obtener la categoría:", error);
    throw error;
  }
}

export async function uploadMediaFromUrl(imageUrl: string): Promise<number> {
  try {
    // Descargar la imagen
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Error al descargar la imagen: ${imageResponse.status}`);
    }

    const buffer = await imageResponse.arrayBuffer();
    const filename = imageUrl.split("/").pop() || "image.jpg";

    // Subir la imagen a WordPress
    const formData = new FormData();
    formData.append("file", new Blob([buffer]), filename);

    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error al subir la imagen: ${response.status}`);
    }

    const media = await response.json();
    return media.id;
  } catch (error) {
    console.error("❌ Error al subir la imagen:", error);
    throw error;
  }
}
