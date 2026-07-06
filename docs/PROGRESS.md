# FasterFy — Reporte de avance (resumen ejecutivo)

> Página única de seguimiento del proyecto. Se actualiza en cada hito.
> Última actualización: v1.0.29.

## Dónde se registra todo (control del proyecto)
- **`docs/PROGRESS.md`** (este archivo) — reporte general.
- **`readme.txt`** → Changelog — detalle técnico por versión.
- **`CONTEXT.md`** — arquitectura, decisiones, negocio, paneles, backlog.
- **`docs/RESILIENCE.md`** — escenarios de fallo y plan de prevención.
- **`legal/`** — términos, privacidad, divulgación de IA y checklist (EN + ES).
- **Historial de Git** — cada commit es un punto de restauración.

## Historial de versiones
| Versión | Fecha | Resumen |
|---|---|---|
| 1.0.0 | 2026-06-18 | Versión inicial: WebP/AVIF, compresión PNG, SVG, IA, colas, rollback, panel |
| 1.0.1 | 2026-06-18 | Arreglo de interruptores rotos y márgenes del panel |
| 1.0.2 | 2026-06-18 | IA genera Descripción + opción de título con guiones (SEO) |
| 1.0.3 | 2026-06-18 | Acciones masivas + cola de IA con reintentos |
| 1.0.4 | 2026-06-18 | WebP visibles en la galería, lotes fiables (navegador), vista cuadrícula, títulos legibles |
| 1.0.5 | 2026-06-19 | Lite/Pro reales, acciones masivas claras, buscador + orden, botón de tema en esquina |
| 1.0.6 | 2026-06-19 | IA en modo "ambas", selección de imágenes, toasts visibles, filtros consistentes |
| 1.0.7 | 2026-06-19 | Seguridad: unserialize seguro + validación de adjunto en rollback |
| 1.0.8 | 2026-06-27 | Kit legal SaaS + divulgación de IA en el panel |
| 1.0.9 | 2026-06-27 | Resiliencia: lock de concurrencia + presupuesto de tiempo; docs y legales en español |
| 1.0.10 | 2026-06-28 | Compresión PNG real (filtro PNG_ALL_FILTERS); aviso de costes de IA en el panel |
| 1.0.11 | 2026-06-29 | IA lee JPEG en lugar de AVIF (modelos de visión no soportan AVIF) |
| 1.0.12 | 2026-06-29 | Acciones masivas unificadas (selección múltiple): optimizar/IA/revertir en 1 clic |
| 1.0.13 | 2026-06-29 | Identidad visual FasterFy: paleta #1F1F1F / #33EE33, logo actualizado |
| 1.0.14 | 2026-06-30 | Panel a pantalla completa (100vh), sin doble scroll, scrollbar visible |
| 1.0.15 | 2026-06-30 | Corrección de hovers y bordes en botones con hover consistente |
| 1.0.16 | 2026-06-30 | Vista de detalle por imagen, orden por tipo de archivo, banner con slider |
| 1.0.17 | 2026-06-30 | Dashboard de rendimiento rediseñado: KPIs, donut animado, comparativa antes/después |
| 1.0.18 | 2026-06-30 | Fix IA: modelos "thinking" (Gemini 2.5) truncaban el JSON; se desactiva razonamiento + parser robusto |
| 1.0.19 | 2026-07-01 | Fiabilidad ante rate-limits (429 = transitorio, no gasta intentos) + filtros por estado + "Reintentar IA fallidas"; AVIF por defecto 80 |
| 1.0.20 | 2026-07-01 | Navegación con flechas en detalle, visibilidad de estado (barra animada + countdown), Lite/Pro diferenciado, menos "IA" en UI |
| 1.0.21 | 2026-07-01 | Eslogan "Pro Media Optimizer" + calidad AVIF por defecto a 50 |
| 1.0.22 | 2026-07-01 | Tope al rate-limit infinito, notificaciones legibles, selects con estilo, tooltips educativos, AVIF por defecto 30 |
| 1.0.23 | 2026-07-01 | Procesamiento en segundo plano real (worker loopback + watchdog cron) |
| 1.0.24 | 2026-07-01 | Segundo plano multi-motor (cron+loopback+navegador) + modal amigable al iniciar lote |
| 1.0.25 | 2026-07-01 | Filtros "con/sin texto" basados en el alt real |
| 1.0.26 | 2026-07-01 | Filtro por fecha de subida (aislar nuevas) + selección por tarjeta/fila |
| 1.0.27 | 2026-07-01 | Barra de filtros ordenada, cuadrícula a 5 columnas, selección miniatura/datos, centro de notificaciones (campana) |
| 1.0.28 | 2026-07-01 | Resumen (operación) vs Rendimiento (impacto) diferenciados + exportar/importar configuración |
| 1.0.29 | 2026-07-01 | Auditoría de seguridad (22/23 ✅) + SECURITY.md; fix DEFAULT de tabla para MySQL 8/estricto |

## Estado funcional (qué funciona)
- ✅ Conversión JPG → WebP/AVIF y compresión PNG **real** (PNG_ALL_FILTERS; probado en producción).
- ✅ Generación de IA: alt text, título (con/sin guiones), leyenda y descripción.
- ✅ **IA lee JPEG en lugar de AVIF** (modelos de visión no soportan AVIF nativamente).
- ✅ Selección múltiple en galería: **acciones masivas unificadas** (optimizar / IA / revertir lo elegido en 1 clic).
- ✅ Rollback no destructivo con respaldo.
- ✅ Modos Lite/Pro diferenciados; **vista lista/cuadrícula/detalle**; buscador y orden (alfabético, fecha, tamaño, tipo).
- ✅ Notificaciones visibles; divulgación de IA; aviso de costes de IA.
- ✅ **Identidad visual FasterFy**: paleta #1F1F1F / #33EE33, logo renovado.
- ✅ **Panel a pantalla completa** (100vh sin doble scroll, scrollbar visible).
- ✅ **Resumen** (centro de operación) vs **Rendimiento** (impacto) diferenciados.
- ✅ **Procesamiento en segundo plano real**: continúa aunque se cierre la pestaña
  (worker loopback + watchdog por WP-Cron + reanudar al volver + aceleración del navegador).
- ✅ **Resiliencia ante rate-limits**: 429/5xx tratados como transitorios (no gastan
  intentos); backoff con `Retry-After`; tope que pausa con aviso si el proveedor bloquea.
- ✅ **Controles por lotes**: filtros por estado (con/sin texto, optimizadas), filtro por
  **fecha de subida** (aislar nuevas), "Reintentar textos fallidos".
- ✅ **UX**: modal amigable al iniciar lote, centro de notificaciones (campana), selección
  por miniatura/datos, tooltips educativos en cada ajuste, selects con estilo del tema.
- ✅ **Exportar/Importar configuración** (JSON, sin API Key).
- ✅ Calidad AVIF por defecto **30** (máximo ahorro); redimensiona a 2560px.
- ✅ **Auditoría de seguridad** documentada en `SECURITY.md` (22/23 buenas prácticas).

## Configuración de IA en pruebas
- Google Gemini (capa gratuita), endpoint OpenAI-compatible,
  modelo `gemini-2.5-flash`, idioma `es`, moderación desactivada.

## Backlog
**Endurecimiento técnico** (de `docs/RESILIENCE.md`):
1. ✅ Backoff ante 429 del proveedor de IA (v1.0.19) — hecho.
2. Cachear conteos del escáner (bibliotecas grandes).
3. Guardas de memoria/dimensiones para imágenes enormes.
4. Auto-purga de respaldos + chequeo de disco.
5. Refresco automático del nonce en lotes largos.
6. Detección de plugins en conflicto (Smush, CDN, etc.).
7. Soporte/validación de Multisite.
8. Pruebas de carga (cuando exista la capa SaaS).

**Funciones de producto:**
- [x] Reset de reintentos de IA desde la UI ("Reintentar textos fallidos", v1.0.19).
- [x] Aislar imágenes nuevas vs. viejas (filtro por fecha, v1.0.26).
- [x] Exportar/Importar configuración (v1.0.28).
- [ ] "Revertir todo" global con confirmación (parcial: existe la acción de cola `rollback`).
- [ ] Informe de ahorro descargable (CSV/PDF).
- [ ] Integración real PageSpeed/Core Web Vitals.

**Comercialización (pre-lanzamiento):**
- [ ] **Internacionalización**: inglés base + español (es_ES) + `fasterfy.pot` (ver SECURITY.md §5).
- [ ] Elegir plataforma de cobro (Freemius vs Lemon Squeezy/Paddle) → panel del dueño.
- [ ] Integrar licencias + entrega de actualizaciones en el plugin.
- [ ] Publicar Lite en WordPress.org; vender Pro.
- [ ] Publicar Términos/Privacidad (revisados por abogado) + DPAs + cookies.

## Auditoría de seguridad (v1.0.29)
Realizada contra un checklist de 23 buenas prácticas de WordPress: **22/23 cubiertas**;
el único pendiente es la i18n del panel (JS), planificada para pre-lanzamiento.
Detalle completo y política de reporte en **`SECURITY.md`**.

## Próximo paso sugerido
Recta final hacia el lanzamiento (cuando la UI esté "congelada"):
1. **Internacionalización (i18n)**: migrar cadenas a inglés como idioma base, generar
   `fasterfy.pot`, y traducir a `es_ES` — **crítico para venta en EE.UU./LATAM**.
2. Elegir e integrar la plataforma de cobro/licencias (Freemius recomendado).
