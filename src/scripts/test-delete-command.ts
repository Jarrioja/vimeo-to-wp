import { TelegramService } from "../services/telegram";
import { getLatestPosts, deletePost } from "../services/wordpress";

async function testDeleteCommand() {
  try {
    console.log("🗑️ Probando comando de eliminación completo...");

    const telegram = new TelegramService();

    // Obtener posts
    console.log("📝 Obteniendo posts...");
    const posts = await getLatestPosts(5);
    console.log(`✅ Posts obtenidos: ${posts.length}`);

    // Simular selección de post
    console.log("🎯 Simulando selección de post...");
    const selectedPost = await telegram.askForPostSelection(posts);

    if (!selectedPost) {
      console.log("❌ No se seleccionó ningún post");
      return;
    }

    console.log(
      `✅ Post seleccionado: ${selectedPost.title?.rendered || "Sin título"}`
    );

    // Simular confirmación
    console.log("🤔 Simulando confirmación de eliminación...");
    const shouldDelete = await telegram.askForPublishing(
      `¿Eliminar el post "${selectedPost.title?.rendered || "Sin título"}"?`
    );

    if (shouldDelete) {
      console.log("✅ Usuario confirmó la eliminación");
      console.log("🗑️ Eliminando post...");

      if (!selectedPost.id) {
        throw new Error("El post no tiene ID válido");
      }

      await deletePost(selectedPost.id);
      console.log("🎉 Post eliminado exitosamente!");
    } else {
      console.log("❌ Usuario canceló la eliminación");
    }
  } catch (error) {
    console.error("❌ Error durante la prueba:", error);
  }
}

testDeleteCommand();
