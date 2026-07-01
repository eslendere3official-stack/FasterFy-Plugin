# FasterFy — Estrategia Comercial y Precios

> **Punto de restauración comercial.** Si retomas este proyecto desde otra
> cuenta o sesión de Kiro, lee este archivo para entender la estrategia de
> negocio, el modelo de precios y el plan de salida al mercado sin depender
> de la memoria del chat. Complementa a `CONTEXT.md` (arquitectura + negocio
> a alto nivel) y a `landing/` (implementación de la landing de pre-lanzamiento).
>
> Última actualización: 1 de julio de 2026.

---

## 1. Resumen ejecutivo

FasterFy es un plugin de WordPress que combina **optimización técnica de
imágenes** (WebP/AVIF, compresión PNG, sanitización SVG) con **generación de
metadatos SEO/accesibilidad vía IA multimodal** (alt text, títulos,
descripciones, renombrado semántico), todo con **arquitectura no destructiva**
(respaldo + rollback en 1 clic).

Estrategia recomendada: **freemium SaaS por suscripción**, publicado en
WordPress.org (versión Lite gratuita para distribución/SEO) con upgrade a
**Pro** y **Agency** de pago, facturado por créditos de IA + funciones
avanzadas. Mercado primario: **Estados Unidos**. Mercado secundario: **LATAM**.

---

## 2. Análisis de mercado y competencia

No existe un competidor que haga exactamente lo mismo (optimización +
metadatos IA + rollback en un solo plugin). Los competidores están divididos
en dos categorías, y FasterFy se posiciona como el punto medio entre ambas:

### 2a. Optimización técnica de imágenes (sin IA)
- **ShortPixel** — plan gratuito (100 imágenes/mes) y plan "Unlimited" a
  **$9.99/mes** (o $99.90/año); también vende créditos de un solo pago que no
  caducan, útiles para librerías grandes de una sola vez.
  ([shortpixel.com/pricing](https://shortpixel.com/pricing), [shortpixel.com/blog](https://shortpixel.com/blog/all-you-can-optimize-new-unlimited-plan-pricing-structure-changes/))
- **Imagify** — gratis hasta 20MB/mes; plan "Growth" ~$4.99–5.99/mes; plan
  "Infinite"/ilimitado ~$9.99/mes.
  ([imagify.io/pricing](https://imagify.io/pricing/), [wordpress.org/plugins/imagify](https://wordpress.org/plugins/imagify/))
- **WP Smush Pro (WPMU DEV)** — desde ~$15/mes (facturado anual, con
  descuentos agresivos el primer año); incluye CDN y backup, planes escalan
  hasta ~$50/mes con más sitios y almacenamiento.
  ([wpmudev.com/project/wp-smush-pro](http://wpmudev.com/project/wp-smush-pro))

**Conclusión**: la optimización técnica "pura" tiene un techo de precio bajo
(~$5–10/mes) porque es un commodity. Smush cobra más ($15–50) pero lo justifica
con CDN + backup + multisite, no con la optimización en sí.

### 2b. Alt text / SEO generado por IA (sin optimización de imagen)
- **AltText.ai** — planes desde ~$5/mes hasta $19+/mes según créditos
  (1 crédito = 1 imagen procesada); plugin gratuito con 25 créditos de regalo.
  ([alttext.ai/pricing](https://alttext.ai/pricing), [alttext.ai/solutions/wordpress](https://alttext.ai/solutions/wordpress))

**Conclusión**: el mercado ya paga $5–19/mes **solo por texto generado por IA**,
sin ningún tipo de optimización de imagen.

### 2c. Dónde queda FasterFy
FasterFy vende **ambas cosas en un solo plugin, con rollback no destructivo**
como diferenciador de confianza (ningún competidor lo ofrece con la misma
fuerza). Comprar por separado un optimizador (~$10/mes) + una herramienta de
alt text (~$15/mes) costaría **~$25/mes**; FasterFy puede posicionar su plan
Pro como un bundle con mejor precio y una sola herramienta que administrar.

---

## 3. Propuesta de valor (mensaje comercial)

- **"Deja de optimizar imágenes de WordPress a mano."** Un solo plugin
  convierte, comprime y describe (SEO + accesibilidad) toda la biblioteca de
  medios automáticamente.
- **Sin riesgo**: todo cambio es reversible con 1 clic (nadie más lo ofrece
  con este nivel de simplicidad).
- **Funciona en cualquier hosting**: lotes conducidos por el navegador, sin
  depender de WP-Cron ni de servidores dedicados.
- **Doble ahorro**: rendimiento (Core Web Vitals, hosting) + tiempo humano
  (SEO/accesibilidad automatizada) + cumplimiento (WCAG/ADA en EE.UU., un
  argumento de venta fuerte para agencias que atienden clientes en EE.UU.).

---

## 4. Segmentos de cliente (ICP)

| Segmento | Necesidad principal | Plan objetivo |
|---|---|---|
| **Blogs/creadores individuales** | Optimizar sin saber de tecnología | Lite (gratis) → upsell ocasional |
| **PyMEs / e-commerce (WooCommerce)** | Velocidad de sitio + SEO de producto | Pro |
| **Agencias / freelancers** | Gestionar decenas de sitios de clientes | Agency |
| **Sitios con foco en accesibilidad/cumplimiento (EE.UU.)** | Alt text WCAG/ADA a escala | Pro / Agency |

---

## 5. Modelo de precios recomendado

Base: **suscripción mensual/anual + créditos de IA** (Lite gratis financia la
distribución vía WordPress.org; Pro/Agency financian el negocio). Estos
precios ya están reflejados como *placeholder* en `landing/index.php`; esta
sección los confirma y los justifica con el análisis de mercado de la sección 2.

| Plan | Precio mensual | Precio anual (equiv./mes) | Créditos IA/mes | Para quién |
|---|---|---|---|---|
| **Lite** | $0 | $0 | 100 | Sitios personales, prueba del producto |
| **Pro** | $19/mes | $15/mes (facturado anual, -20%) | 5,000 | Sitios profesionales / PyMEs |
| **Agency** | $59/mes | $47/mes (facturado anual, -20%) | 25,000 | Agencias multi-sitio |

**Crédito de IA = 1 imagen procesada por el modelo de visión** (genera alt
text + título + descripción + renombrado semántico en una sola pasada).

### Empaquetado de funciones por plan

| Función | Lite | Pro | Agency |
|---|---|---|---|
| Conversión WebP/AVIF + compresión PNG | ✅ | ✅ | ✅ |
| Sanitización SVG | ✅ | ✅ | ✅ |
| Rollback no destructivo | ✅ | ✅ | ✅ |
| Alt text / título / descripción con IA | Limitado (100 créditos) | ✅ (5,000 créditos) | ✅ (25,000 créditos) |
| Renombrado semántico automático | ❌ | ✅ | ✅ |
| Acciones masivas (selección múltiple) | Básico (todo o nada) | ✅ completo | ✅ completo |
| Moderación NSFW + controles avanzados (temperatura, exclusiones) | ❌ | ✅ | ✅ |
| Gestión multi-sitio | ❌ | ❌ | ✅ |
| Soporte | Comunidad (foro WP.org) | Email prioritario | Prioritario + onboarding |
| Reglas de exclusión / throttling avanzado | ❌ | Parcial | ✅ completo |

### Paquetes de créditos adicionales (add-on, pago único)
Para picos de uso sin forzar upgrade de plan (inspirado en el modelo de
créditos de ShortPixel que "nunca caducan"):
- 1,000 créditos extra — **$9** (pago único)
- 5,000 créditos extra — **$35** (pago único)

Esto evita perder ventas cuando un cliente Lite necesita procesar una
biblioteca grande una sola vez, sin comprometerse a una suscripción.

### Oferta "Founding Member" (para la waitlist actual)
Recomendación: **descuento del 30% de por vida** (mientras la suscripción
permanezca activa sin cancelar), NO un "lifetime deal" de pago único. Esto
protege el ingreso recurrente (MRR) y sigue siendo un incentivo fuerte para
convertir a la lista de espera en clientes el día del lanzamiento.
- Pro fundador: ~$13.30/mes en vez de $19.
- Agency fundador: ~$41.30/mes en vez de $59.

### Consideración de precios por región (LATAM)
EE.UU. es el mercado primario y define el precio de lista en USD. Para LATAM
(mercado secundario) se puede evaluar más adelante un descuento por poder de
compra (PPP) vía cupones regionales — **no es prioritario para el lanzamiento**,
queda en el backlog de la sección 9.

---

## 6. Unit economics (a validar con datos reales antes del lanzamiento)

⚠️ Estos son supuestos de planeación, no cifras confirmadas. Deben validarse
con el proveedor de IA final elegido (hoy en pruebas: Gemini 2.5 Flash vía
endpoint compatible con OpenAI) antes de fijar precios en la plataforma de
cobro:

- **Costo variable por crédito de IA**: depende del proveedor/modelo elegido
  en producción (no todos los clientes usarán su propia API key — si FasterFy
  centraliza la IA como parte del plan de pago, ese costo lo absorbe FasterFy).
- **Margen objetivo sugerido**: ≥70% bruto en los planes de pago, dejando
  margen para procesamiento, soporte, plataforma de cobro (Freemius/Lemon
  Squeezy suelen cobrar 5–8.9% + fee fijo por transacción) e impuestos.
- **Decisión pendiente clave**: ¿el cliente usa **su propia API key** de IA
  (costo cero para FasterFy, como hoy) o FasterFy **centraliza y revende**
  acceso a IA dentro de la suscripción (requiere pasar créditos por costo
  real del proveedor)? Esta decisión cambia todo el modelo de costos y debe
  tomarse antes de integrar la plataforma de licencias.

---

## 7. Estrategia de salida al mercado (Go-to-Market)

### Fase 0 — Pre-lanzamiento (EN CURSO)
- Landing de captura de waitlist ya construida (`landing/`), con precios
  placeholder ya alineados a esta estrategia.
- Objetivo: acumular lista de espera + validar interés antes de invertir en
  licenciamiento.

### Fase 1 — Lanzamiento Lite en WordPress.org
- Publicar versión Lite gratuita en el directorio oficial → canal de
  adquisición gratuito más importante para plugins de WordPress (descubrimiento
  orgánico, reseñas, SEO del propio directorio).
- Objetivo de esta fase: **instalaciones y reseñas**, no ingresos.

### Fase 2 — Activación del paywall Pro/Agency
- Upsell dentro del propio panel del plugin (banners no intrusivos, límite de
  créditos visible, CTA de upgrade cuando se agotan créditos IA).
- Integrar plataforma de licencias/cobro (ver sección 8).
- Email a la waitlist con oferta "Founding Member".

### Fase 3 — Canal de agencias
- Programa de afiliados/referidos para agencias (comisión recurrente por
  cliente Agency referido).
- Presencia en foros/comunidades de agencias WordPress (Facebook groups,
  WPMRR, Advanced WordPress).

### Fase 4 — Contenido y SEO
- Comparativas directas: "FasterFy vs Smush", "FasterFy vs ShortPixel",
  "Cómo cumplir WCAG/ADA con alt text automático" — apuntando a EE.UU.
  (cumplimiento de accesibilidad es un tema legal activo allí).
- Casos de uso con métricas reales (Core Web Vitals antes/después) usando el
  propio dashboard de rendimiento del plugin como prueba social.

### Fase 5 — Adquisición pagada (opcional, post-validación)
- Google Ads sobre términos de intención alta ("webp converter wordpress",
  "alt text generator plugin").
- Solo después de confirmar LTV/CAC positivo con canales orgánicos.

---

## 8. Plataforma de licencias y cobro (decisión pendiente del dueño)

Ya documentado en `CONTEXT.md`; resumen aplicado a esta estrategia:

| Opción | Ventaja | Cuándo conviene |
|---|---|---|
| **Freemius** | Todo en uno (licencias, pagos, actualizaciones, analítica), pensado específicamente para plugins de WordPress | Recomendado para arrancar rápido |
| **Lemon Squeezy / Paddle** | Actúan como *Merchant of Record* (gestionan impuestos/VAT de EE.UU. y globales) | Si se prioriza simplicidad fiscal internacional |
| **Easy Digital Downloads + Software Licensing + Recurring** | Autoalojado, máximo control, sin comisión de marketplace | Si se quiere evitar dependencia de un tercero |

**Recomendación**: Freemius para el lanzamiento inicial (menor fricción,
soporte nativo del modelo Lite/Pro), reevaluar EDD si el volumen justifica
más control a mediano plazo.

---

## 9. Backlog comercial (pendiente, priorizado)

### 🔴 Bloqueante para vender
1. Confirmar decisión de la sección 6 (API key del cliente vs IA centralizada).
2. Elegir plataforma de licencias/cobro (sección 8) e integrarla en el plugin.
3. Completar internacionalización (inglés base + es_ES) — ver `CONTEXT.md`.
4. Revisar Términos/Privacidad con abogado antes de publicar (`legal/`).

### 🟡 Importante, no bloqueante
5. Página de comparación vs. competidores (contenido de Fase 4).
6. Programa de afiliados para agencias.
7. Descuento regional LATAM (PPP) vía cupones.
8. Definir política de reembolso/cancelación (estándar SaaS: 14–30 días).

### 🟢 Deseable
9. Contador social ("N se unieron a la lista de espera") en la landing.
10. Integración con CRM/email marketing con doble opt-in (ya en backlog de `landing/HANDOFF.md`).

---

## 10. Cómo queda constatada esta estrategia en el repositorio

- **Este archivo** (`docs/ESTRATEGIA-COMERCIAL.md`) es la fuente única de
  verdad de precios y estrategia comercial.
- Enlazado desde `CONTEXT.md` (sección de modelo de negocio), `README.md`
  (sección "Business Model") y `DOCUMENTACION.md` (índice maestro).
- Los precios ya implementados en `landing/index.php` (planes Lite/Pro/Agency)
  coinciden con la tabla de la sección 5 — si se cambian los precios aquí,
  **también hay que actualizar la landing** (`landing/index.php`,
  `landing/preview.html` y los diccionarios EN/ES de `landing/assets/js/main.js`).
- Cualquier cambio a esta estrategia debe registrarse aquí y, si aplica, en
  `docs/PROGRESS.md` (historial) para mantener trazabilidad.

## 11. Cómo retomar esto desde otra cuenta/sesión de Kiro

1. Asegura acceso al repo `EslenderE3/FasterFy-Plugin`.
2. Lee, en este orden: `docs/RESUMEN-EJECUTIVO.md` → `CONTEXT.md` →
   **este archivo** → `landing/HANDOFF.md`.
3. Pide: *"Lee docs/ESTRATEGIA-COMERCIAL.md y ayúdame a [avanzar la
   integración de licencias / ajustar precios / preparar el lanzamiento]"*.

---

## Fuentes consultadas (precios de mercado, julio 2026)

- ShortPixel — planes y precios: [shortpixel.com/pricing](https://shortpixel.com/pricing) · [shortpixel.com/blog (comparativa de costos)](https://shortpixel.com/blog/cost-comparison-image-optimization/)
- Imagify — planes y precios: [imagify.io/pricing](https://imagify.io/pricing/) · [wordpress.org/plugins/imagify](https://wordpress.org/plugins/imagify/)
- WP Smush Pro (WPMU DEV) — planes y precios: [wpmudev.com/project/wp-smush-pro](http://wpmudev.com/project/wp-smush-pro)
- AltText.ai — planes y precios: [alttext.ai/pricing](https://alttext.ai/pricing) · [alttext.ai/solutions/wordpress](https://alttext.ai/solutions/wordpress)

*Nota: contenido de estas fuentes fue reformulado y resumido; no se reproduce
texto textual más allá de cifras de precio públicas.*
