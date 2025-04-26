# Vimeo to WordPress Post

Aplicación para integrar Vimeo con WordPress, específicamente diseñada para publicar clases grabadas automáticamente.

## Requisitos

- Node.js (v16 o superior)
- pnpm
- WordPress con los siguientes plugins:
  - [Advanced Custom Fields (ACF)](https://wordpress.org/plugins/advanced-custom-fields/) - Versión gratuita
  - [ACF to REST API](https://wordpress.org/plugins/acf-to-rest-api/) - Para exponer los campos de ACF en la API
- Cuenta de Vimeo con API access
- Bot de mensajería configurado (ver sección de configuración)

## Configuración

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   pnpm install
   ```
3. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
4. Configura las variables de entorno en el archivo `.env`:
   - Credenciales de Vimeo (desde tu dashboard de desarrollador de Vimeo)
   - Configuración de WordPress (URL y credenciales)
   - Token del bot de mensajería
   - ID del chat autorizado

5. Configura ACF en WordPress:
   - Crea una página de opciones
   - Configura los campos necesarios para cada día:
     - Categoría
     - Entrenadores (trainer_1, trainer_2, trainer_3)
     - Imágenes de entrenadores (image_1, image_2)
   - Asegúrate de que el endpoint de ACF esté accesible

## Uso

### Iniciar el Bot

Para iniciar el bot de mensajería:

```bash
pnpm start
```

El bot estará disponible con los siguientes comandos:
- `/start` - Muestra mensaje de bienvenida
- `/publicar` - Inicia el proceso de publicación de la última clase

### Publicación Automática

El bot está programado para ejecutarse automáticamente:
- 7:30 AM (hora Miami)
- 11:30 AM (hora Miami)

En cada ejecución programada, el bot:
1. Obtiene el último video de Vimeo
2. Solicita confirmación para publicar
3. Permite seleccionar el entrenador
4. Publica el post con la imagen correspondiente

### Verificación de Conexión

Para verificar la conexión con WordPress y la configuración de ACF:

```bash
pnpm check:connection
```

## Estructura del Proyecto

- `src/services/`: Servicios para interactuar con Vimeo, WordPress y mensajería
- `src/types/`: Definiciones de tipos TypeScript
- `src/use-cases/`: Casos de uso de la aplicación
- `src/scripts/`: Scripts ejecutables
- `src/config/`: Configuración y validación de variables de entorno

## Notas de Seguridad

- Usa un application password de WordPress en lugar de tu contraseña principal
- Mantén tus credenciales de API seguras
- No compartas tu archivo `.env`
- Solo los chats autorizados pueden usar el bot
- Las clases se publican con privacidad configurada para ser vistas solo cuando están incrustadas

## Configuración de ACF

La aplicación espera la siguiente estructura en ACF:

```json
{
  "config_day_1": {
    "category": {
      "term_id": number,
      "name": string
    },
    "trainers": {
      "trainer_1": {
        "image_1": number,
        "image_2": number|false
      },
      "trainer_2": {
        "image_1": number,
        "image_2": number|false
      },
      "trainer_3": {
        "image_1": number,
        "image_2": number|false
      }
    }
  },
  // ... config_day_2 hasta config_day_6
}
```

## Solución de Problemas

Si encuentras algún error:
1. Verifica que todas las variables de entorno estén configuradas correctamente
2. Asegúrate de que los endpoints de WordPress y ACF sean accesibles
3. Confirma que el bot tenga permisos para enviar mensajes
4. Revisa los logs en la consola para más detalles

## Mantenimiento

Para mantener el sistema funcionando correctamente:
1. Actualiza regularmente las dependencias
2. Monitorea los logs del bot
3. Verifica periódicamente la conexión con WordPress
4. Mantén actualizadas las imágenes de los entrenadores en WordPress 