import { getACFOptionsConfig } from "../services/wordpress";
import { VimeoWPConfig } from "../types/wordpress";

async function testConnection() {
  try {
    console.log(
      "🔍 Probando conexión con WordPress y obteniendo configuración ACF..."
    );

    const config = await getACFOptionsConfig();
    console.log("✅ Conexión exitosa!");
    console.log("📝 Configuración completa:", JSON.stringify(config, null, 2));

    // Mostrar configuración de cada día
    for (let i = 1; i <= 6; i++) {
      const dayKey = `config_day_${i}` as keyof VimeoWPConfig;
      console.log(`\nDía ${i}:`, config[dayKey]);
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testConnection();
