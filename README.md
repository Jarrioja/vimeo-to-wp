# Vimeo to WordPress Post

Aplicación para integrar Vimeo con WordPress, específicamente diseñada para publicar clases grabadas automáticamente.

## Requisitos

- Node.js (v16 o superior)
- pnpm
- WordPress con los siguientes plugins:
  - [Advanced Custom Fields (ACF)](https://wordpress.org/plugins/advanced-custom-fields/) - Versión gratuita
  - [ACF to REST API](https://wordpress.org/plugins/acf-to-rest-api/) - Para exponer los campos de ACF en la API
- Cuenta de Vimeo con API access

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
5. Configura ACF en WordPress:
   - Crea una página de opciones
   - Configura los campos necesarios para cada día (categoría y entrenadores)
   - Asegúrate de que el endpoint de ACF esté accesible en `/wp-json/acf/v3/options/`
   - Ver [ejemplo detallado de configuración ACF](docs/acf-config-example.md)

## Uso

Para publicar el último video de Vimeo como una clase grabada:

```bash
pnpm publish:video
```

Para publicar un video específico para un día específico:

```bash
pnpm publish:video [1-6] [video_id]
```

Donde:
- `[1-6]` es el número del día (1 = Lunes, 6 = Sábado)
- `[video_id]` es el ID opcional del video de Vimeo

Para verificar la conexión con WordPress y la configuración de ACF:

```bash
pnpm check:connection
```

## Estructura del Proyecto

- `src/services/`: Servicios para interactuar con Vimeo y WordPress
- `src/types/`: Definiciones de tipos TypeScript
- `src/use-cases/`: Casos de uso de la aplicación
- `src/scripts/`: Scripts ejecutables
- `src/config/`: Configuración y validación de variables de entorno

## Notas

- La aplicación espera una configuración específica en ACF de WordPress
- Los videos se publican con privacidad configurada para ser vistos solo cuando están incrustados
- Las categorías y entrenadores se configuran a través de ACF en WordPress

## Seguridad

- Usa un application password de WordPress en lugar de tu contraseña principal
- Mantén tus credenciales de API seguras
- No compartas tu archivo `.env` 