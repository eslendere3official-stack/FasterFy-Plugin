=== FasterFy — Pro Media Optimizer ===
Contributors: fasterfy
Tags: webp, avif, image optimization, compression, ai, alt text, seo, media, performance, core web vitals
Requires at least: 6.0
Tested up to: 6.5
Requires PHP: 8.0
Stable tag: 1.0.27
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Optimización masiva, inteligente y retroactiva de activos visuales: conversión a WebP/AVIF, compresión PNG, sanitización SVG, reconocimiento de imagen e inyección de Alt Text con IA, colas asíncronas no bloqueantes y arquitectura no destructiva (rollback).

== Description ==

FasterFy actúa directamente sobre el sistema de archivos y la base de datos de WordPress para optimizar el rendimiento técnico (Web Core Vitals) y enriquecer el SEO mediante visión artificial.

**Características principales**

* **Pipeline por tipo MIME**
  * JPG/JPEG → transcodificación a WebP o AVIF con compresión inteligente con pérdida.
  * PNG → compresión por cuantización de color conservando el canal alfa (estilo TinyPNG).
  * SVG → sanitización del XML (elimina scripts, manejadores `on*`, `javascript:` y metadatos de diseño). Sin compresión de mapa de bits.
* **Optimización retroactiva y mutación nativa**: escanea la tabla `wp_posts` (`post_type = 'attachment'`), reemplaza el archivo, regenera miniaturas y reescribe las referencias en `post_content` y `postmeta` (incluyendo datos serializados).
* **Inyección nativa de Alt Text SEO**: la IA multimodal genera descripciones denotativas y actualiza `_wp_attachment_image_alt`.
* **Gobierno de IA**: temperatura baja (anti-alucinación), moderación de contenido NSFW previa. Si un activo es sensible, se optimiza técnicamente pero **no** se envía al modelo generativo (protege las cuentas de API).
* **Arquitectura no destructiva (rollback)**: respaldo del original en un directorio aislado y restauración con un clic.
* **Colas asíncronas no bloqueantes**: usa Action Scheduler si está disponible, con respaldo en WP-Cron. Throttling (tamaño de lote, concurrencia, enfriamiento) y control de cuotas/créditos.
* **Panel SaaS premium**: dashboard en tiempo real, vistas Lite y Pro, tracker de rendimiento, gestión de cola, biblioteca y registros.

== Installation ==

1. Copia la carpeta `fasterfy` en `wp-content/plugins/`.
2. (Opcional) Ejecuta `composer install` dentro de la carpeta para cargar el autoloader optimizado. No es obligatorio: el plugin incluye su propio autoloader.
3. (Recomendado) Instala el plugin "Action Scheduler" o WooCommerce para colas robustas.
4. Activa **FasterFy — Pro Media Optimizer** desde el menú Plugins.
5. Abre el menú **FasterFy** en el panel de administración.

**Requisitos del servidor**

* PHP 8.0 o superior.
* Extensión **Imagick** (recomendada) o **GD** con soporte WebP/AVIF.
* Para IA: una API Key de un proveedor compatible con OpenAI (o el endpoint de FasterFy Cloud).

== Frequently Asked Questions ==

= ¿Es seguro? Modifica mis archivos originales =
Sí. Antes de cualquier mutación, FasterFy crea un respaldo del original en `wp-content/uploads/fasterfy-backups`. Puedes revertir cualquier activo con un clic.

= ¿Dónde se guarda la API Key? =
Cifrada en reposo (AES-256-CBC) usando las llaves de seguridad de tu instalación de WordPress. Nunca se expone al frontend.

= ¿Funciona sin IA? =
Sí. La optimización técnica (WebP/AVIF, compresión, SVG) funciona sin configurar IA. La IA es opcional para Alt Text y SEO.

== Developer Hooks ==

* `fasterfy_ai_provider` (filter): registra un proveedor de IA personalizado.
* `fasterfy_moderation_verdict` (filter): integra un servicio de moderación externo (p.ej. Google Cloud Vision SafeSearch).
* `fasterfy_booted` (action): se dispara cuando el plugin termina de arrancar.

== REST API (namespace: fasterfy/v1) ==

Todas las rutas requieren capacidad `manage_options` y nonce `wp_rest`.

* `GET  /summary` — resumen de biblioteca, cola y cuota.
* `GET  /capabilities` — motores de imagen y formatos soportados.
* `GET  /settings`, `POST /settings` — leer/guardar configuración.
* `GET  /media` — listado paginado (`status=all|pending|optimized`).
* `POST /optimize` — optimiza un adjunto (`{ id, mode }`).
* `POST /rollback` — revierte un adjunto (`{ id }`).
* `GET  /queue/status`, `POST /queue/start|pause|resume|cancel` — control de la cola.
* `GET  /logs`, `DELETE /logs` — registros.
* `POST /ai/test` — prueba la conexión con el proveedor de IA.
* `POST /ai/item` — aplica IA a un adjunto (`{ id }`).

== Changelog ==

= 1.0.27 =
* Biblioteca: barra de filtros reorganizada (búsqueda + "Mostrar" por fecha + "Ordenar"), con selects que ahora sí encajan con el diseño oscuro.
* Cuadrícula: pasa de ~7 a 5 columnas en pantallas amplias (se adapta hacia abajo), para que no se vea apretado.
* Selección más intuitiva: tocar la MINIATURA marca/desmarca la imagen; tocar el ÁREA DE DATOS abre la ficha detallada.
* Nuevo centro de notificaciones: una campana junto al botón de tema guarda los avisos para poder leerlos con calma (con contador de no leídos). Los avisos ahora duran más en pantalla según su longitud.

= 1.0.26 =
* Biblioteca: nuevo filtro por fecha de subida (Cualquier fecha / Hoy / 7 días / 30 días) para aislar las imágenes recién añadidas y no mezclarlas con las antiguas. El orden "Más recientes" pasa a llamarse "Últimas añadidas".
* Biblioteca: ahora se puede seleccionar una imagen tocando toda la tarjeta o fila (no solo el checkbox). Para abrir la ficha detallada se usa el botón "Detalles".

= 1.0.25 =
* Filtros de biblioteca más intuitivos: "Con texto SEO" y "Sin texto" ahora se basan en si la imagen tiene realmente texto alternativo (no en un estado interno), corrigiendo que una imagen con texto pudiera aparecer en "Sin texto".

= 1.0.24 =
* Segundo plano más robusto: además del worker loopback, ahora la cola se encadena por WP-Cron/Action Scheduler (con spawn_cron al iniciar) y se reanuda automáticamente al volver a la pestaña. Los tres motores comparten un bloqueo para no duplicar trabajo, así el proceso continúa en más servidores aunque cierres la pestaña.
* Nuevo aviso amigable al iniciar un lote: explica que puede tardar unos minutos, que puedes seguir con otras tareas, con barra de progreso y consejos rotando.

= 1.0.23 =
* Procesamiento en segundo plano REAL: el trabajo por lotes ahora continúa en el servidor aunque cierres la pestaña o navegues a otra parte de WordPress. Se implementa con un worker que se auto-encadena mediante peticiones loopback no bloqueantes, más un vigilante (watchdog) por WP-Cron que reanuda la cadena si se corta. No requiere WooCommerce ni Action Scheduler.
* El navegador, cuando está abierto, sigue acelerando el proceso (coordinado por un bloqueo para no duplicar trabajo).
* Se retira el aviso de "no cierres la pestaña": ahora se informa que el proceso continúa en segundo plano.

= 1.0.22 =
* Fiabilidad: si el proveedor de textos limita las peticiones de forma sostenida (posible cuota diaria agotada), la cola ya no espera indefinidamente en "ritmo ajustado": se pausa tras varios ciclos y avisa con un mensaje claro para reanudar más tarde.
* UX/notificaciones: el indicador de progreso de acciones por selección ahora es legible (colores explícitos, ya no se veía oscuro sobre oscuro) y aparece en el mismo lugar que el resto de avisos (arriba a la derecha), con más consistencia.
* UX: corregidas las flechas de navegación de la ficha de detalle, que deformaban el diseño y provocaban scroll horizontal; ahora se fijan a los lados de la pantalla.
* UX: los desplegables (select) adoptan el estilo del plugin (flecha propia y tema oscuro), en lugar del aspecto nativo antiguo.
* UX: aviso al intentar cerrar o cambiar de página con un lote en marcha (el proceso lo conduce el navegador).
* Educación: cada ajuste incluye ahora una leyenda explicativa (qué hace el formato objetivo, directorios/IDs excluidos, nivel de registro, etc.).
* Conversión: la calidad AVIF por defecto baja a 30 para máximo ahorro de peso (AVIF mantiene buena calidad incluso a valores bajos).
* Textos: "Aplicar IA al subir" pasa a llamarse "Generar textos SEO al subir".

= 1.0.21 =
* Marca: el eslogan pasa a ser "Pro Media Optimizer" (panel, nombre del plugin y documentación).
* Conversión: la calidad AVIF por defecto ahora es 50, que produce archivos mucho más ligeros manteniendo una calidad visual excelente. (En instalaciones existentes, ajusta el slider de Calidad AVIF a 50 una vez.)

= 1.0.20 =
* UX: la vista de detalle ahora se navega con las flechas ← → del teclado (y botones ‹ › en pantalla); Esc para cerrar.
* UX (visibilidad del estado): la barra de progreso tiene animación mientras procesa, y cuando el proveedor aplica rate-limit se muestra una cuenta regresiva "reanudando en Ns…" para que quede claro que el sistema sigue trabajando.
* UX: indicador flotante de progreso ("n / total") al aplicar acciones sobre una selección de imágenes.
* Fix: en la ficha de detalle, el botón de generar texto ya no se queda "cargando" indefinidamente; al terminar refresca la ficha con los textos nuevos.
* Modo Lite/Pro ahora es claramente distinto: Lite ofrece una única acción "todo en uno"; Pro muestra acciones separadas, filtros por estado avanzados y reintento de fallidas. Insignia visible del modo activo.
* Marca/UX: se reduce el uso del término "IA" en la interfaz a favor de "SEO / Textos" (la funcionalidad es la misma). Se mantienen las menciones técnicas/legales necesarias (aviso de privacidad).
* Ajustes: los controles de calidad WebP/AVIF ahora explican que un valor menor produce archivos más ligeros (para máximo ahorro con AVIF, 50–60).

= 1.0.19 =
* IA (fiabilidad): los límites de peticiones del proveedor (HTTP 429, típicos en planes gratuitos como Gemini) ya NO se tratan como error permanente. Antes, tras 3 topes de rate-limit una imagen quedaba excluida para siempre y el lote "se detenía"; ahora esos errores son transitorios, no gastan reintentos y la imagen se reprocesa automáticamente.
* IA (backoff): la cola respeta el tiempo de espera sugerido por el proveedor (cabecera Retry-After) y auto-regula su ritmo hasta completar todo el lote sin intervención.
* IA (selección manual): la generación por lotes seleccionados añade una pausa entre peticiones para no saturar el proveedor.
* Biblioteca: nuevos filtros por estado — Sin optimizar, Optimizados, IA aplicada, IA pendiente, IA con error — para gestión masiva.
* Biblioteca: botón "Reintentar IA fallidas" que reinicia y relanza la generación de las imágenes con error de IA en un clic.
* Conversión: la calidad AVIF por defecto ahora es 80 (peso muy bajo con calidad excelente) en instalaciones nuevas.

= 1.0.18 =
* IA (fix importante): los modelos "thinking" como Gemini 2.5 Flash consumían el presupuesto de tokens razonando y devolvían el JSON truncado o vacío; ahora se desactiva el razonamiento en endpoints de Google y se amplía el límite de tokens (400 → 1500). El texto generado (alt, título, descripción, keywords) vuelve a aplicarse correctamente.
* IA: parser de respuesta más robusto — tolera JSON envuelto en markdown (```json), recupera pares clave/valor de respuestas truncadas y evita guardar fragmentos de JSON como alt text.
* IA: mensajes de error más útiles (incluye motivo de finalización y un fragmento de la respuesta del modelo) para diagnóstico.
* Diagnóstico: nuevos endpoints REST (/diagnostic/ai y /diagnostic/ai/connection) y guías de troubleshooting.

= 1.0.17 =
* Rendimiento rediseñado: tarjetas KPI, donut animado de progreso, gráfico de composición por tipo de archivo y comparativa antes/después con barras animadas y métricas de ROI.
* UI: corregido el título de la ficha de detalle que chocaba con el botón de cerrar.

= 1.0.16 =
* Biblioteca: vista de detalle por imagen (clic en la miniatura o en "Detalles"): muestra formato, dimensiones, tamaños, ahorro y %, conversión, textos generados (alt/título/leyenda/descripción), respaldo y enlace a WP.
* Biblioteca: nuevo orden "Tipo de archivo"; corrección del "Seleccionar todo / Limpiar".
* Resumen: banner con slider de beneficios (rotación automática + puntos de navegación).
* UI: inputs y selects con bordes redondeados (consistencia con el diseño).

= 1.0.15 =
* UI: el panel ocupa exactamente 100vh (barra lateral a altura completa, sin recuadro sobrante) y el scroll queda solo dentro del contenido. Se oculta el pie de WP en la página del plugin para eliminar el scroll de página en escritorio.
* UI: corregido el hover de los botones (ya no se pierde el fondo ni el texto queda ilegible); ahora usa un realce de brillo.

= 1.0.14 =
* UI: el panel ocupa todo el bloque de pantalla y se elimina el doble scroll (un único scroll de página). Barra lateral fija (sticky) y botón de tema flotante. Ajustes responsive para tablet y móvil.

= 1.0.13 =
* Branding: identidad visual FasterFy aplicada (paleta #1F1F1F / #33EE33 / #ffffff). Nuevo logo (escudo hexagonal con rayo y chispa) en la barra lateral, pantalla de carga e ícono del menú de WordPress; botones, anillo de progreso, toggles, toasts y acentos en verde de marca.

= 1.0.12 =
* IA en imágenes AVIF ya existentes: el plugin lee el AVIF guardado y crea una copia JPEG al vuelo para el análisis (no requiere re-subir las fotos). Respaldo robusto Imagick/GD para garantizar la conversión AVIF/WebP → JPEG.

= 1.0.11 =
* CORRECCIÓN IA (importante): los modelos de visión no leen AVIF. Ahora el plugin envía una copia JPEG redimensionada para el análisis, así la generación de texto funciona con imágenes AVIF/WebP/cualquier formato.
* AVIF: la conversión de PNG usa el "Formato objetivo" elegido (WebP o AVIF, ambos conservan transparencia).

= 1.0.10 =
* CORRECCIÓN PNG: la compresión ahora reduce de verdad. Si comprimir el PNG no ahorra (común en hosts con GD), se convierte a WebP conservando transparencia y se elige el resultado más pequeño.
* UX: acciones masivas unificadas con las de selección y por imagen (Optimizar / Generar IA / Revertir), para no confundir.
* Galería: "Seleccionar todo" (marca/desmarca toda la página) para elegir muchas y descartar pocas.
* "Revertir todo" masivo con confirmación.
* UI: títulos y números con menos peso y más interlineado en las tarjetas del resumen; desplegable de orden con texto legible al desplegarse.

= 1.0.9 =
* Resiliencia: bloqueo de concurrencia (lock con auto-expiración) que evita doble procesamiento si hay varias pestañas o WP-Cron activos.
* Resiliencia: presupuesto de tiempo (~20s) por lote para evitar timeouts en hosts compartidos.
* Documentación: docs/RESILIENCE.md (escenarios de fallo y prevención) y plantillas legales en español (legal/es/).

= 1.0.8 =
* Cumplimiento: divulgación de IA dentro del panel (transparencia) y carpeta legal/ con plantillas de Términos, Privacidad, divulgación de IA y checklist de cumplimiento SaaS adaptado.

= 1.0.7 =
* Seguridad: la reescritura de datos serializados usa unserialize con allowed_classes=false (previene PHP object injection).
* Seguridad: el endpoint de rollback valida que el ID sea un adjunto.

= 1.0.6 =
* CORRECCIÓN IA: el modo "Optimizar + IA" ahora también genera textos en imágenes ya optimizadas (antes terminaba sin hacer nada si la optimización ya estaba completa).
* Selección de imágenes: casillas en la galería (lista y cuadrícula) para optimizar, generar IA o revertir SOLO las fotos elegidas.
* Notificaciones rediseñadas: más visibles, con icono y colores de alto contraste, en la esquina superior derecha.
* Filtros (buscador y orden) rediseñados para ser consistentes con el estilo del panel.
* Evita re-consumir cuota de IA en imágenes que ya tienen texto generado.

= 1.0.5 =
* UX acciones masivas: en modo Lite, un único botón "Procesar toda la biblioteca"; en modo Pro, las 3 acciones (comprimir / textos IA / ambas) con descripción.
* Lite vs Pro ahora se diferencian de verdad: el modo Lite simplifica el menú y oculta opciones avanzadas (temperatura, renombrado semántico, moderación, throttling, exclusiones).
* Biblioteca: buscador por nombre y ordenamiento (recientes, antiguas, mayor ahorro, A-Z) para gestionar bibliotecas grandes sin borrar archivos.
* Botón de tema claro/oscuro movido a la esquina superior derecha como icono.

= 1.0.4 =
* IMPORTANTE: las imágenes ya convertidas a WebP/AVIF vuelven a aparecer en la biblioteca del plugin (antes desaparecían y no se les podía aplicar IA ni revertir).
* Procesamiento masivo fiable: ahora lo conduce el navegador por lotes (run_batch), sin depender de WP-Cron, que en muchos hosts no se ejecuta. Las acciones globales ya funcionan.
* Nueva vista en cuadrícula en la biblioteca (además de la lista), ideal para pantallas pequeñas. Se recuerda la preferencia.
* UI: títulos legibles en tema oscuro (se forzaba el color oscuro de wp-admin).

= 1.0.3 =
* Acciones masivas en la Biblioteca: "Optimizar todo", "Optimizar + IA (todo)" y "Generar textos IA (todo)".
* Nueva cola de IA independiente que detecta y reprocesa los activos sin texto, con reintentos automáticos (hasta 3) para tolerar límites de velocidad de la API.
* Barra de progreso de la cola visible también en la Biblioteca, con pausar/reanudar/detener.
* Indicador del estado de IA (✓ / ✕ / bloqueado) en cada fila de la tabla.

= 1.0.2 =
* IA: nueva generación del campo "Descripción" del adjunto (post_content).
* IA: nueva opción "Título con guiones (SEO)" que separa las palabras del título con guiones.
* Ambas opciones son configurables desde la pestaña IA & SEO.

= 1.0.1 =
* UI: corregidos los interruptores (toggles) que se mostraban rotos por un conflicto de especificidad CSS.
* UI: el panel ahora es un contenedor flotante con márgenes (ya no queda pegado al borde) y esquinas redondeadas.

= 1.0.0 =
* Versión inicial: pipeline WebP/AVIF/PNG/SVG, IA multimodal con moderación, colas asíncronas, rollback y panel SPA.
