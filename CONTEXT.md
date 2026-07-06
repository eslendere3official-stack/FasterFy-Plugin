# FasterFy — Documento de contexto del proyecto

> Este archivo es el "punto de restauración de contexto". Si retomas el proyecto
> en otra sesión, léelo primero para entender el estado actual sin depender de
> la memoria del chat. La **fuente de la verdad es el código del repositorio**.

## Qué es
Plugin nativo de WordPress (PHP 8+) para optimización de medios:
- Conversión JPG → **WebP/AVIF**, compresión **PNG** (con alfa), sanitización **SVG**.
- **IA multimodal** (compatible con OpenAI): genera Alt Text, título, descripción y
  renombrado semántico. Moderación NSFW opcional.
- **Procesamiento en segundo plano real**: worker loopback + watchdog por WP-Cron +
  reanudar al volver a la pestaña + aceleración del navegador (todos coordinados por un lock).
- **Arquitectura no destructiva**: respaldo + rollback de cada imagen.
- Panel SPA propio (sin framework de build) con modos **Lite** y **Pro**.

## Versión actual
**1.0.29** (ver `readme.txt` → Changelog para el historial completo).
Eslogan de marca: **"Pro Media Optimizer"**.

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
- `includes/Queue/QueueManager.php` — cola por lotes (`run_batch` con lock, presupuesto de
  tiempo y tope de rate-limit; `process_batch` para cron).
- `includes/Queue/BackgroundWorker.php` — worker de segundo plano (loopback + watchdog cron).
- `includes/AI/` — `AIManager`, `OpenAIProvider` (visión), `Moderation`, `VisionResult`.
- `includes/Rest/RestController.php` — API REST `fasterfy/v1` (incl. endpoints de diagnóstico).
- `includes/Admin/Admin.php` — menú y carga de assets.
- `admin/` — `css/fasterfy-admin.css`, `js/fasterfy-admin.js` (SPA), `views/app.php`.
- `SECURITY.md` — auditoría de seguridad y política de reporte de vulnerabilidades.
- `docs/` — `PROGRESS.md`, `RESILIENCE.md`, `RESUMEN-EJECUTIVO.md`, `DOCUMENTACION.md`,
  `DIAGNOSTICO-IA.md`, `COMO-DIAGNOSTICAR.md`.

## Decisiones clave
- **MIME visibles vs optimizables**: la galería del plugin muestra también WebP/AVIF
  (para aplicarles IA/rollback), pero solo optimiza JPEG/PNG/SVG.
- **IA lee JPEG en lugar de AVIF**: los modelos de visión (OpenAI, Gemini) no soportan
  AVIF; cuando se procesa IA sobre una imagen ya convertida, se envía una copia temporal JPEG.
- **Compresión PNG real**: usa `PNG_ALL_FILTERS` (filtro 5) para compresión efectiva con canal alfa.
- **Calidad AVIF por defecto = 30** (máximo ahorro; AVIF mantiene buena calidad aun bajo).
  Redimensiona imágenes > 2560px al subir. El número es "calidad", no "% de compresión".
- **Segundo plano multi-motor**: `BackgroundWorker` dispara peticiones loopback que se
  auto-encadenan; `process_batch` (cron/AS) y el navegador también empujan. Un lock
  (transient) evita duplicar trabajo. Watchdog cron cada minuto reanuda cadenas caídas.
- **Rate-limit resiliente**: 429/5xx/red = transitorios (no gastan intentos, quedan
  `pending`); se respeta `Retry-After`; tras varios ciclos bloqueados sin avanzar la cola
  se pausa con `notice` (evita esperar sin fin cuando el proveedor agota su cuota).
- **Modos de cola**: `optimize` (solo comprimir), `ai` (solo textos, con reintentos
  hasta 3 por imagen) y `both` (procesa lo que necesite optimización O texto).
- **Acciones masivas unificadas**: selección múltiple en galería permite optimizar/IA/revertir
  en 1 clic; el navegador conduce los lotes (`/queue/run` → `run_batch`).
- **Lite vs Pro**: Lite simplifica menú/acciones; Pro expone opciones avanzadas.
- **No destructivo**: se respalda el original antes de optimizar; rollback con 1 clic.
- **Identidad visual**: paleta #1F1F1F (negro) / #33EE33 (verde neón), logo FasterFy aplicado.
- **Panel a pantalla completa** (100vh sin doble scroll) con vistas lista/cuadrícula/detalle.
- **Resumen vs Rendimiento**: Resumen = centro de operación (estado, cola, acciones);
  Rendimiento = impacto (ahorro, velocidad, comparativas). Sin duplicar gráficos.
- **Selección en galería**: la miniatura marca/desmarca; el área de datos abre el detalle.
- **Marca**: eslogan "Pro Media Optimizer" (se redujo el uso de "IA" en la UI a favor de
  "SEO/Textos"; se conservan las menciones técnicas/legales).

## Metadatos (postmeta) que usa el plugin
- `_fasterfy_status` (optimized|error), `_fasterfy_saved_bytes`, `_fasterfy_format_from`, `_fasterfy_format_to`
- `_fasterfy_original_size`, `_fasterfy_optimized_size`, `_fasterfy_optimized_at`, `_fasterfy_renamed_to`
- `_fasterfy_backup` (registro del respaldo)
- `_fasterfy_ai_status` (done|error|blocked|pending), `_fasterfy_ai_attempts`, `_fasterfy_ai_at`
- Texto SEO nativo de WP: `_wp_attachment_image_alt` (base de los filtros "con/sin texto")

## Opciones y cron propios
- Opciones: `fasterfy_settings`, `fasterfy_queue_state`, `fasterfy_worker_token`, `fasterfy_db_version`.
- Cron: `fasterfy_worker_watch` (watchdog, cada minuto), `fasterfy_worker_resume`,
  `fasterfy_process_batch`, `fasterfy_cleanup_logs`. Se limpian en el Deactivator.

## Cómo restaurar una versión anterior
1. En GitHub → pestaña **Commits**.
2. Abre el commit deseado → **Code → Download ZIP**, o pídeme volver a esa versión.

## Backlog / ideas pendientes (no implementadas)
**Funciones de producto:**
- [x] Reset del contador de reintentos de IA desde la UI (v1.0.19).
- [x] Aislar imágenes nuevas vs. viejas — filtro por fecha (v1.0.26).
- [x] Exportar/Importar configuración (v1.0.28).
- [x] Procesamiento en segundo plano real (v1.0.23-1.0.24).
- [ ] "Revertir todo" global con confirmación (existe la acción de cola `rollback`).
- [ ] Informe de ahorro descargable (CSV/PDF).
- [ ] Integración real de PageSpeed/Core Web Vitals (hook `fasterfy_performance_metrics`).

**Endurecimiento técnico** (detalle en `docs/RESILIENCE.md`):
- [x] Backoff ante 429 del proveedor de IA respetando `Retry-After` (v1.0.19-1.0.22).
- [ ] Cachear conteos del escáner (transient) para bibliotecas grandes.
- [ ] Guardas de memoria/dimensiones antes de procesar imágenes muy grandes.
- [ ] Comprobación de espacio en disco + auto-purga de respaldos por antigüedad.
- [ ] Refresco automático del nonce en lotes largos.
- [ ] Detección de plugins de optimización en conflicto (Smush, ShortPixel, CDN).
- [ ] Soporte/validación de Multisite.
- [ ] Pruebas de carga (cuando exista la capa SaaS).

**Comercialización (pre-lanzamiento) — PRIORITARIO:**
- [ ] **Internacionalización (i18n)**: inglés como idioma base + español (`es_ES`) + generar `fasterfy.pot`.
- [ ] Elegir plataforma de cobro (Freemius vs Lemon Squeezy/Paddle) → panel del dueño.
- [ ] Integrar licencias + entrega de actualizaciones en el plugin.
- [ ] Publicar Lite en WordPress.org; vender Pro.
- [ ] Publicar Términos/Privacidad (revisados por abogado) + DPAs + cookies.

## Comprobaciones antes de subir cambios
- `php -l` en los archivos PHP modificados.
- `node --check admin/js/fasterfy-admin.js`.
- Subir versión en `fasterfy.php` (cabecera + `FASTERFY_VERSION`) y `readme.txt`.


## Modelo de negocio y hoja de ruta comercial (IMPORTANTE)
Objetivo del dueño: vender FasterFy como **producto por suscripción (SaaS)**.
- **Mercados objetivo**: LATAM y, sobre todo, **Estados Unidos**.
- **Idioma**: debe ser **multilenguaje**, con **inglés como idioma base/por defecto** y
  español como segunda traducción. (Hoy las cadenas están en español; pendiente migrar
  el idioma fuente a inglés y traducir a es_ES.)
- **Modelo**: suscripción basada en consumo (créditos de assets / uso de IA), alineado
  con la arquitectura cloud original. Lite gratis + Pro de pago.

### Implicaciones técnicas a respetar de aquí en adelante
- Escribir **nuevas cadenas en inglés** y envolverlas en i18n:
  - PHP: `__()`, `esc_html__()` con text domain `fasterfy`.
  - JS: migrar a `wp.i18n` (`wp-i18n`) en lugar de texto fijo en el SPA.
- Generar `languages/fasterfy.pot` y mantener `es_ES`.
- Mantener la separación Lite/Pro como base del paywall (free en WordPress.org, Pro de pago).

### Stack de licencias/cobros sugerido (a decidir)
- **Freemius** (llave en mano: licencias, pagos, suscripciones, actualizaciones, analítica) — más simple.
- **Easy Digital Downloads + Software Licensing + Recurring** (autoalojado, más control).
- **Lemon Squeezy / Paddle** como *Merchant of Record* (gestionan impuestos/VAT de EE.UU. y global).
- Entrega de actualizaciones Pro vía servidor propio o el de la plataforma elegida.


## Legal y cumplimiento (carpeta `legal/`)
Kit inicial de cumplimiento para SaaS (NO es asesoría legal; revisar con abogado):
- `legal/COMPLIANCE-CHECKLIST.md` — los 5 cimientos adaptados a FasterFy con estado real.
- `legal/TERMS-OF-SERVICE-TEMPLATE.md` y `legal/PRIVACY-POLICY-TEMPLATE.md` — plantillas (inglés) para la web de venta.
- `legal/AI-DISCLOSURE.md` — divulgación de IA (resumen mostrado dentro del panel).

Distinción clave de responsabilidades:
- Plugin autoalojado → el CLIENTE es responsable de datos; el vendedor debe divulgar IA y qué datos salen.
- Web de venta → Términos, Privacidad, cookies, pagos (Stripe/Paddle/Lemon Squeezy), impuestos (Merchant of Record).
- SaaS en la nube (futuro, API key en servidor propio) → obligaciones completas de responsable de datos.

Pendientes legales (tu tarea, fuera del código): estructura legal/fiscal, publicar Términos/Privacidad,
banner de cookies, DPAs de subprocesadores (proveedor de IA, hosting, pagos), procesador de pagos + impuestos.


## Resiliencia y escalabilidad
Ver `docs/RESILIENCE.md`: escenarios que podrían romper el plugin (timeouts, memoria,
concurrencia, rate limits de IA, disco, BD) con su estado y plan de prevención.
Aplicado: bloqueo de concurrencia (lock con auto-expiración) y presupuesto de tiempo
(~20 s) en `run_batch` (v1.0.9); resiliencia ante rate-limits con backoff y tope
(v1.0.19-1.0.22); procesamiento en segundo plano multi-motor con watchdog (v1.0.23-1.0.24).
Documentos legales en español: `legal/es/`.

## Seguridad
Auditoría completa en **`SECURITY.md`** (v1.0.29): 22/23 buenas prácticas de WordPress
cubiertas (SQL con `prepare`, escape de salida, nonce+capacidad en REST, SVG anti-XSS/XXE,
API key cifrada, sin secretos en JS, etc.). Pendiente: i18n del panel (JS) para pre-lanzamiento.


## Panel de administración del dueño (cómo se controla el negocio)
Existen hasta 3 paneles distintos:
1. **Panel del plugin** (en WordPress) → lo usa el CLIENTE en su sitio. YA construido.
2. **Panel de negocio** (licencias, cobros, ventas, entrega de actualizaciones) → es el
   panel del DUEÑO y lo aporta la plataforma elegida (NO se programa). Recomendado:
   **Freemius** (todo en uno para plugins WP); alternativa MoR: Lemon Squeezy / Paddle.
3. **Panel SaaS en la nube** (cuentas, créditos, uso por cliente, logs) → solo si se
   centraliza la IA en servidor propio; habría que construirlo. Fase futura.

Hoy (plugin autoalojado): el dueño NO accede al WordPress de los clientes (mejor para
privacidad y responsabilidad legal). El "centro de mando" del dueño = dashboard de la
plataforma de cobros/licencias.


## Cómo retomar el proyecto en una sesión o cuenta nueva de Kiro
El proyecto es portable; no depende de la memoria del chat. Para continuar:
1. Asegura acceso al repo `EslenderE3/FasterFy-Plugin` (lectura para clonar; escritura para subir cambios).
2. Conecta/clona el repositorio en la nueva sesión de Kiro.
3. Pídele: "Lee CONTEXT.md, docs/PROGRESS.md y docs/RESILIENCE.md y continúa el proyecto FasterFy".
Nota: una sesión/cuenta nueva NO recuerda conversaciones previas, pero estos documentos
contienen arquitectura, decisiones, estado, backlog y dirección comercial para retomar sin pérdida.


## Trabajo en paralelo: carpeta `landing/`
El repositorio incluye una **landing page de pre-lanzamiento** (lista de espera + precios)
en la carpeta `landing/`, creada en OTRA sesión de Kiro (ver `landing/HANDOFF.md`).
Es independiente del plugin (no comparte archivos con `includes/`, `admin/`, etc.).

Coordinación para evitar conflictos cuando hay sesiones en paralelo:
- La sesión del PLUGIN trabaja en la raíz (`fasterfy.php`, `includes/`, `admin/`, `docs/`, `legal/`).
- La sesión de la LANDING trabaja solo en `landing/`.
- Antes de cambios grandes, hacer `pull` primero; los pushes se rechazan si el remoto avanzó.
