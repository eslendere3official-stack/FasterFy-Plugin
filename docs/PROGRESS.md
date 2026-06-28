# FasterFy — Reporte de avance (resumen ejecutivo)

> Página única de seguimiento del proyecto. Se actualiza en cada hito.
> Última actualización: v1.0.9.

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

## Estado funcional (qué funciona)
- ✅ Conversión JPG → WebP/AVIF y compresión PNG (probado en producción del usuario).
- ✅ Generación de IA: alt text, título (con/sin guiones), leyenda y descripción.
- ✅ Selección múltiple en galería (optimizar / IA / revertir lo elegido).
- ✅ Acciones masivas por lotes conducidas por el navegador.
- ✅ Rollback no destructivo con respaldo.
- ✅ Modos Lite/Pro diferenciados; vista lista/cuadrícula; buscador y orden.
- ✅ Notificaciones visibles; divulgación de IA.
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
Pendiente de confirmación del usuario: validar que la **IA con selección múltiple**
genera bien los textos tras actualizar a la última versión.
