import { z } from "zod";

const envSchema = z.object({
  VIMEO_CLIENT_ID: z.string().min(1),
  VIMEO_CLIENT_SECRET: z.string().min(1),
  VIMEO_ACCESS_TOKEN: z.string().min(1),
  WORDPRESS_URL: z.string().url(),
  WORDPRESS_USERNAME: z.string().min(1),
  WORDPRESS_PASSWORD: z.string().min(1),
  WORDPRESS_CPT: z.string().min(1),
  WORDPRESS_VIMEO_META_KEY: z.string().min(1),
  WORDPRESS_ACF_OPTIONS_SLUG: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_CHAT_ID: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const env = {
    VIMEO_CLIENT_ID: process.env.VIMEO_CLIENT_ID,
    VIMEO_CLIENT_SECRET: process.env.VIMEO_CLIENT_SECRET,
    VIMEO_ACCESS_TOKEN: process.env.VIMEO_ACCESS_TOKEN,
    WORDPRESS_URL: process.env.WORDPRESS_URL,
    WORDPRESS_USERNAME: process.env.WORDPRESS_USERNAME,
    WORDPRESS_PASSWORD: process.env.WORDPRESS_PASSWORD,
    WORDPRESS_ACF_OPTIONS_SLUG:
      process.env.WORDPRESS_ACF_OPTIONS_SLUG || "options",
    WORDPRESS_CPT: process.env.WORDPRESS_CPT,
    WORDPRESS_VIMEO_META_KEY: process.env.WORDPRESS_VIMEO_META_KEY,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error("❌ Error de validación de variables de entorno:");
    result.error.errors.forEach((error) => {
      console.error(`  - ${error.path.join(".")}: ${error.message}`);
    });
    process.exit(1);
  }

  return result.data;
}
