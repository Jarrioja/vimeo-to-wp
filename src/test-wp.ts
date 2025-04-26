import { testWordPressConnection, getDayConfig } from "./services/wordpress";

async function main() {
  try {
    // Probar la conexión general

    // Probar obtener la configuración de un día específico
    const dayConfig = await getDayConfig(1); // Prueba con el día 1
    console.log(
      "\n📅 Configuración del día 1:",
      JSON.stringify(dayConfig, null, 2)
    );
  } catch (error) {
    console.error("❌ Error en las pruebas:", error);
    process.exit(1);
  }
}

main();
