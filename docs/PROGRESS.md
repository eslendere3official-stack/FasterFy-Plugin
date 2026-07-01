# FasterFy — Reporte de avance (resumen ejecutivo)

> Página única de seguimiento del proyecto. Se actualiza en cada hito.
> Última actualización: v1.0.17.

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
- ✅ **Dashboard de rendimiento**: KPIs, gráfico de donut animado, comparativa antes/después.
- ✅ Base de seguridad sólida (ver COMPLIANCE-CHECKLIST.md).

## Configuración de IA en pruebas
- Google Gemini (capa gratuita), endpoint OpenAI-compatible,
  modelo `gemini-2.5-flash`, idioma `es`, moderación desactivada.

## Backlog (acordado: se hará más adelante)
**Endurecimiento técnico** (de `docs/RESILIENCE.md`):
1. Backoff ante 429 del proveedor de IA.
2. Cachear conteos del escáner (bibliotecas grandes).
3. Guardas de memoria/dimensiones para imágenes enormes.
4. Auto-purga de respaldos + chequeo de disco.
5. Refresco automático del nonce en lotes largos.
6. Detección de plugins en conflicto (Smush, CDN, etc.).
7. Soporte/validación de Multisite.
8. Pruebas de carga (cuando exista la capa SaaS).

**Funciones de producto:**
- [ ] "Revertir todo" global con confirmación.
- [ ] Informe de ahorro descargable (CSV/PDF).
- [ ] "Seleccionar todo (página)" en la galería.
- [ ] Reset de reintentos de IA desde la UI.
- [ ] Integración real PageSpeed/Core Web Vitals.

**Comercialización (pre-lanzamiento):**
- [ ] Internacionalización: inglés base + español (es_ES) + `fasterfy.pot`.
- [ ] Elegir plataforma de cobro (Freemius vs Lemon Squeezy/Paddle) → panel del dueño.
- [ ] Integrar licencias + entrega de actualizaciones en el plugin.
- [ ] Publicar Lite en WordPress.org; vender Pro.
- [ ] Publicar Términos/Privacidad (revisados por abogado) + DPAs + cookies.

## Próximo paso sugerido
Pendiente de confirmación del usuario:
1. **Internacionalización (i18n)**: migrar cadenas a inglés como idioma base, generar `fasterfy.pot`, y traducir a `es_ES` — **crítico para venta en EE.UU./LATAM**.
2. Validar que las funciones nuevas del dashboard y selección múltiple funcionan correctamente en producción.
