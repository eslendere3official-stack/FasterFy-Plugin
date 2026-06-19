# FasterFy — Documento de contexto del proyecto

> Este archivo es el "punto de restauración de contexto". Si retomas el proyecto
> en otra sesión, léelo primero para entender el estado actual sin depender de
> la memoria del chat. La **fuente de la verdad es el código del repositorio**.

## Qué es
Plugin nativo de WordPress (PHP 8+) para optimización de medios:
- Conversión JPG → **WebP/AVIF**, compresión **PNG** (con alfa), sanitización **SVG**.
- **IA multimodal** (compatible con OpenAI): genera Alt Text, título, descripción y
  renombrado semántico. Moderación NSFW opcional.
- **Procesamiento por lotes** conducido por el navegador (no depende de WP-Cron).
- **Arquitectura no destructiva**: respaldo + rollback de cada imagen.
- Panel SPA propio (sin framework de build) con modos **Lite** y **Pro**.

## Versión actual
**1.0.6** (ver `readme.txt` → Changelog para el historial completo).

## Configuración de IA en uso (pruebas)
- Proveedor: OpenAI-compatible apuntando a **Google Gemini** (capa gratuita).
- Endpoint base: `https://generativelanguage.googleapis.com/v1beta/openai`
- Modelo: `gemini-2.5-flash` · Idioma: `es`
- Moderación: desactivada (Gemini gratuito no tiene endpoint `/moderations`).

## Mapa de archivos
- `fasterfy.php` — bootstrap, constantes, autoloader PSR-4 propio.
- `includes/Core.php` — contenedor de servicios y arranque.
- `includes/Settings.php` — opciones (cifra la API key en reposo).
- `includes/Logger.php` — log en tabla `{prefix}fasterfy_log`.
- `includes/Processors/` — motor de imagen (Imagick/GD), JPEG/PNG/SVG, factory, renombrado.
- `includes/Media/` — `MediaScanner` (escaneo/consulta), `BackupManager` (rollback), `UploadInterceptor`.
- `includes/Queue/QueueManager.php` — cola por lotes (`run_batch` síncrono que conduce el navegador).
- `includes/AI/` — `AIManager`, `OpenAIProvider` (visión), `Moderation`, `VisionResult`.
- `includes/Rest/RestController.php` — API REST `fasterfy/v1`.
- `includes/Admin/Admin.php` — menú y carga de assets.
- `admin/` — `css/fasterfy-admin.css`, `js/fasterfy-admin.js` (SPA), `views/app.php`.

## Decisiones clave
- **MIME visibles vs optimizables**: la galería del plugin muestra también WebP/AVIF
  (para aplicarles IA/rollback), pero solo optimiza JPEG/PNG/SVG.
- **Modos de cola**: `optimize` (solo comprimir), `ai` (solo textos, con reintentos
  hasta 3 por imagen) y `both` (procesa lo que necesite optimización O texto).
- **Lotes vía navegador** (`/queue/run` → `run_batch`): fiable en cualquier hosting;
  requiere mantener la pestaña abierta.
- **Lite vs Pro**: Lite simplifica menú/acciones; Pro expone opciones avanzadas.
- **No destructivo**: se respalda el original antes de optimizar; rollback con 1 clic.

## Metadatos (postmeta) que usa el plugin
- `_fasterfy_status` (optimized|error), `_fasterfy_saved_bytes`, `_fasterfy_format_to`
- `_fasterfy_backup` (registro del respaldo)
- `_fasterfy_ai_status` (done|error|blocked), `_fasterfy_ai_attempts`

## Cómo restaurar una versión anterior
1. En GitHub → pestaña **Commits**.
2. Abre el commit deseado → **Code → Download ZIP**, o pídeme volver a esa versión.

## Backlog / ideas pendientes (no implementadas)
- [ ] "Revertir todo" global con confirmación.
- [ ] Informe de ahorro descargable (CSV/PDF).
- [ ] "Seleccionar todo (página)" en la galería.
- [ ] Reset del contador de reintentos de IA desde la UI.
- [ ] Integración real de PageSpeed/Core Web Vitals (hook `fasterfy_performance_metrics`).

## Comprobaciones antes de subir cambios
- `php -l` en los archivos PHP modificados.
- `node --check admin/js/fasterfy-admin.js`.
- Subir versión en `fasterfy.php` (cabecera + `FASTERFY_VERSION`) y `readme.txt`.
