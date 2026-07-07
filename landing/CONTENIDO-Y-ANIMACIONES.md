# FasterFy — Landing: Contenido y Animaciones

Documento de referencia con **todos los textos** (inglés / español) y **todas las animaciones e interacciones** de la landing de prelanzamiento.

- **Idioma base:** Inglés (EN). Español (ES) como secundario, conmutable con el switch EN/ES.
- **Archivos que renderizan este contenido:**
  - `index.php` — versión real (con PHP, seguridad, envío del formulario).
  - `preview.html` — vista previa estática autónoma (form simulado).
  - Textos i18n: `assets/js/main.js` (y duplicados inline en `preview.html`).
  - Estilos/animaciones: `assets/css/styles.css` (y duplicados inline en `preview.html`).

> ⚠️ **Importante:** si editas un texto o estilo, hay que cambiarlo **en los dos sitios** (`index.php` + `main.js`/`styles.css` **y** en `preview.html`) para que ambas versiones queden sincronizadas.

---

## 1. Metadatos (SEO / social)

| Campo | Contenido |
|---|---|
| `<title>` | FasterFy — AI Media Optimizer for WordPress \| Join the waitlist |
| `meta description` | FasterFy automates WordPress image optimization: WebP/AVIF conversion, smart compression, AI alt text & SEO, bulk gallery management and 1-click rollback. Join the pre-launch waitlist. |
| `og:title` | FasterFy — AI Media Optimizer for WordPress |
| `og:description` | Stop optimizing images by hand. WebP/AVIF, AI alt text & SEO, bulk processing and 1-click rollback for WordPress. Join the waitlist. |
| `twitter:description` | Automate WordPress image optimization with AI. Join the pre-launch waitlist. |

---

## 2. Cabecera / Navegación

| Clave | EN | ES |
|---|---|---|
| Logo | Faster**Fy** | Faster**Fy** |
| `nav.features` | Features | Funciones |
| `nav.how` | How it works | Cómo funciona |
| `nav.faq` | FAQ | Preguntas |
| `nav.cta` (botón) | Join waitlist | Unirme a la lista |
| Switch idioma | EN / ES | EN / ES |
| `skip` (skip-link) | Skip to the waitlist | Saltar a la lista de espera |

> La sección **Precios (Pricing)** fue eliminada de la navegación y del cuerpo para la fase de validación.

---

## 3. Hero (bloque principal = waitlist)

Narrativa: **dolor → agitación → promesa → escasez → acción**.

| Clave | EN | ES |
|---|---|---|
| `hero.badge` | Pre-launch · Founding access | Prelanzamiento · Acceso fundador |
| `hero.title` | Your WordPress images are quietly killing your speed and your SEO. | Tus imágenes de WordPress están frenando tu velocidad y tu SEO en silencio. |
| `hero.lead` | Every heavy image slows your pages, buries you in Google and steals hours of manual work. FasterFy converts, compresses and writes SEO alt text across your whole library — automatically. Join the waitlist and be first in line when we launch. | Cada imagen pesada ralentiza tus páginas, te hunde en Google y te roba horas de trabajo manual. FasterFy convierte, comprime y redacta el alt text SEO de toda tu biblioteca — automáticamente. Únete a la lista y sé de los primeros cuando lancemos. |

### Formulario (waitlist)

| Clave | EN | ES |
|---|---|---|
| `form.email.label` | Work email | Correo de trabajo |
| `form.email.placeholder` | you@yourcompany.com | tu@tuempresa.com |
| `form.submit` (botón) | Reserve my spot | Reservar mi lugar |
| `form.consent` | I agree to receive launch updates. No spam — unsubscribe anytime. | Acepto recibir novedades del lanzamiento. Sin spam — cancela cuando quieras. |
| `form.note` | Founding members lock in our lowest price, forever — before we open to everyone. | Los miembros fundadores conservan nuestro precio más bajo, para siempre — antes de abrir a todo el mundo. |
| `hero.scarcity` | Founding access is limited — the earlier you join, the better your launch price. | El acceso fundador es limitado — cuanto antes te unas, mejor será tu precio de lanzamiento. |

### Bullets de confianza (bajo el formulario)

| Clave | EN | ES |
|---|---|---|
| `hero.trust.1` | No credit card | Sin tarjeta de crédito |
| `hero.trust.2` | Non-destructive · 1-click rollback | No destructivo · reversión en 1 clic |
| `hero.trust.3` | Built for WordPress | Hecho para WordPress |

### Tarjeta de resultados (showcase del hero)

| Clave | EN | ES |
|---|---|---|
| `float.saved` | Saved this week | Ahorrado esta semana |
| `float.joined` | Joined the waitlist | En la lista de espera |
| `hero.card.live` | Live | En vivo |
| `hero.card.stat1` | Average weight reduction | Reducción de peso promedio |
| `hero.card.stat2` | Images optimized | Imágenes optimizadas |
| `hero.card.stat3` | + AVIF output | + salida AVIF |
| `hero.card.stat4` | Alt text coverage | Cobertura de alt text |
| `hero.card.stat5` | Originals lost | Originales perdidos |

Valores mostrados: **73%** (reducción media), **1.248** imágenes, **WebP**, **100%** alt text, **0** originales perdidos, **12.4 h** ahorradas, **1.248** en lista.

---

## 4. Tira de tecnologías (marquee horizontal)

| Clave | EN | ES |
|---|---|---|
| `strip.1` | WebP & AVIF | WebP y AVIF |
| `strip.2` | AI Alt Text & SEO | Alt Text con IA y SEO |
| `strip.3` | Bulk gallery processing | Procesamiento masivo |
| `strip.4` | Smart compression | Compresión inteligente |
| `strip.5` | Auto semantic rename | Renombrado semántico |
| `strip.6` | SVG sanitization | Sanitización de SVG |

---

## 5. Funciones (Features)

| Clave | EN | ES |
|---|---|---|
| `features.eyebrow` | What you get | Lo que obtienes |
| `features.title` | Real work, done for you | Trabajo real, hecho por ti |
| `features.sub` | Every feature is built to save time and lift performance — measurable wins, not busywork. | Cada función está pensada para ahorrar tiempo y mejorar el rendimiento — resultados medibles, no tareas tediosas. |

| # | Icono | Título EN / ES | Descripción EN | Descripción ES |
|---|---|---|---|---|
| 1 | ⚡ | Next-gen formats / Formatos de nueva generación | Convert JPG to WebP or AVIF and crush PNGs without visible quality loss — the core lever for Core Web Vitals. | Convierte JPG a WebP o AVIF y comprime PNG sin pérdida visible de calidad — la palanca clave para los Core Web Vitals. |
| 2 | 🤖 | AI alt text & SEO / Alt text con IA y SEO | Multimodal vision writes accurate alt text, titles and descriptions — boosting accessibility and search rankings. | La visión multimodal redacta alt text, títulos y descripciones precisos — mejorando la accesibilidad y el posicionamiento. |
| 3 | 🗂️ | Bulk gallery management / Gestión masiva de galerías | Process your whole library in batches. Select, optimize, generate AI text or revert — hundreds of images at once. | Procesa toda tu biblioteca por lotes. Selecciona, optimiza, genera textos con IA o revierte — cientos de imágenes a la vez. |
| 4 | ✏️ | Automatic semantic rename / Renombrado semántico automático | Turn "IMG_4821.jpg" into descriptive, keyword-rich filenames that search engines actually read. | Convierte "IMG_4821.jpg" en nombres descriptivos y ricos en palabras clave que los buscadores sí leen. |
| 5 | ↩️ | Non-destructive rollback / Reversión no destructiva | Every original is backed up before any change. Restore any asset with a single click — zero risk. | Cada original se respalda antes de cualquier cambio. Restaura cualquier archivo con un clic — sin riesgos. |
| 6 | 🛡️ | Security built in / Seguridad incorporada | SVG sanitization strips malicious scripts, and optional NSFW moderation protects your AI usage and brand. | La sanitización de SVG elimina scripts maliciosos y la moderación NSFW opcional protege tu uso de IA y tu marca. |

---

## 6. Cómo funciona (How it works)

| Clave | EN | ES |
|---|---|---|
| `how.eyebrow` | How it works | Cómo funciona |
| `how.title` | Live in minutes, not days | Operativo en minutos, no en días |

| Paso | Título EN / ES | Descripción EN | Descripción ES |
|---|---|---|---|
| 1 | Install & connect / Instala y conecta | Activate the plugin on WordPress. No build tools, no servers to manage. | Activa el plugin en WordPress. Sin herramientas de compilación ni servidores que administrar. |
| 2 | Scan your library / Escanea tu biblioteca | FasterFy finds every image and shows exactly what can be optimized — retroactively. | FasterFy encuentra cada imagen y muestra exactamente qué se puede optimizar — de forma retroactiva. |
| 3 | Optimize in bulk / Optimiza en masa | Run a batch and watch weight drop and SEO coverage climb. Roll back anytime. | Ejecuta un lote y mira cómo baja el peso y sube la cobertura SEO. Revierte cuando quieras. |

---

## 7. ROI (impacto en números)

| Clave | Valor | EN | ES |
|---|---|---|---|
| `roi.1` | ↑ 73% | Lighter images on average | Imágenes más livianas en promedio |
| `roi.2` | ↑ Hours / Horas | Saved every week vs. manual work | Ahorradas cada semana vs. trabajo manual |
| `roi.3` | ↑ 100% | Alt text coverage for SEO | Cobertura de alt text para SEO |
| `roi.4` | ✓ Zero / Cero | Originals ever lost | Originales perdidos, nunca |

---

## 8. Preguntas frecuentes (FAQ)

| Clave | EN | ES |
|---|---|---|
| `faq.eyebrow` | FAQ | Preguntas |
| `faq.title` | Questions, answered | Preguntas, respondidas |

| # | Pregunta EN / ES | Respuesta EN | Respuesta ES |
|---|---|---|---|
| 1 | Will it touch my original files? / ¿Toca mis archivos originales? | Never destructively. FasterFy backs up every original before any change, and you can restore any image with one click. | Nunca de forma destructiva. FasterFy respalda cada original antes de cualquier cambio y puedes restaurar cualquier imagen con un clic. |
| 2 | Do I need AI to use it? / ¿Necesito IA para usarlo? | No. Technical optimization (WebP/AVIF, compression, SVG) works on its own. AI alt text and SEO are optional add-ons. | No. La optimización técnica (WebP/AVIF, compresión, SVG) funciona por sí sola. El alt text con IA y el SEO son complementos opcionales. |
| 3 | Will it work on my host? / ¿Funcionará en mi hosting? | Yes. Bulk processing runs in safe, browser-driven batches, so it works reliably even on shared hosting. | Sí. El procesamiento masivo se ejecuta en lotes seguros conducidos por el navegador, así que funciona de forma fiable incluso en hosting compartido. |
| 4 | When does it launch? / ¿Cuándo se lanza? | We're in pre-launch. Join the waitlist and you'll be first to get access — plus founding-member pricing. | Estamos en prelanzamiento. Únete a la lista y serás de los primeros en obtener acceso — además del precio de miembro fundador. |
| 5 | Is my data safe? / ¿Están seguros mis datos? | API keys are encrypted at rest, SVGs are sanitized, and sensitive images are never sent to AI when moderation is on. | Las claves de API se cifran en reposo, los SVG se sanitizan y las imágenes sensibles nunca se envían a la IA cuando la moderación está activa. |

---

## 9. CTA final + Footer

| Clave | EN | ES |
|---|---|---|
| `cta.title` | Be first when FasterFy launches | Sé el primero cuando FasterFy se lance |
| `cta.sub` | Join the waitlist for early access and founding-member pricing. | Únete a la lista para acceso anticipado y precio de miembro fundador. |
| `cta.btn` | Join the waitlist | Unirme a la lista |
| `footer.tag` | AI media optimization for WordPress. | Optimización de medios con IA para WordPress. |
| `footer.rights` | All rights reserved. | Todos los derechos reservados. |

---

## 10. Mensajes del formulario (feedback)

| Clave | EN | ES |
|---|---|---|
| `msg.invalidEmail` | Please enter a valid email address. | Introduce una dirección de correo válida. |
| `msg.consent` | Please accept to continue. | Acepta para continuar. |
| `msg.sending` | Sending… | Enviando… |
| `msg.success` | You're on the list! Check your inbox to confirm. | ¡Estás en la lista! Revisa tu correo para confirmar. |
| `msg.error` | Something went wrong. Please try again. | Algo salió mal. Inténtalo de nuevo. |
| `msg.throttled` | Too many attempts. Please try again later. | Demasiados intentos. Inténtalo más tarde. |
| Preview (banner) | Static preview — the form is simulated (no data is sent or stored). | Vista previa estática — el formulario es simulado (no se envía ni guarda ningún dato). |

---

## 11. Sistema de diseño (tokens)

| Token | Valor | Uso |
|---|---|---|
| Fondo (ink) | `#1a1a1a` / `#121212` | Base oscura |
| Marca (brand) | `#33ee33` (lima) | Acentos, botones, foco |
| Texto | `#f4f6f4` / muted `#aab0aa` | Cuerpo |
| Panel verde | `#14241a` | Tarjetas destacadas |
| Ancho máximo | `1440px` | Layout full-width moderno |
| Radios | 14 / 20 / 30 / 40 px + pill 999px | Bordes redondeados |
| Tipografía display | **Space Grotesk** | Títulos (h1, h2, h3) |
| Tipografía cuerpo | **Inter** | Texto y logo |
| Curva de easing | `cubic-bezier(.16, 1, .3, 1)` | Todas las transiciones |

---

## 12. Animaciones e interacciones

> Todas respetan **`prefers-reduced-motion`**: si el usuario activa "Reducir movimiento" en su sistema/navegador, se desactivan (animaciones, brillos, marquee) y el scroll pasa a instantáneo. Es comportamiento intencional de accesibilidad.

| # | Animación / Interacción | Dónde | Técnica | Detalle / Timing |
|---|---|---|---|---|
| 1 | **Aurora de fondo** | Global (`body::before`) | CSS `@keyframes ff-aurora` | Gradientes verdes que se desplazan/escalan muy lento. **20s**, `ease-in-out`, `infinite alternate`, `blur(32px)`. |
| 2 | **Barra de progreso de scroll** | Borde superior (`.scroll-progress`) | JS (`initProgress`) + CSS | El ancho se ajusta al % de scroll. `requestAnimationFrame`, transición `width .08s`. |
| 3 | **Marquee (scroll horizontal)** | Tira de tecnologías | CSS `@keyframes ff-marquee` | Desplazamiento horizontal continuo (`translateX 0 → -50%`). **34s** lineal, infinito. **Se pausa al pasar el ratón**. Máscara de desvanecido en los bordes. |
| 4 | **Brillo en botón (shine)** | Botones `.btn--primary` | CSS `@keyframes ff-shine` | Reflejo diagonal que barre el botón al hacer **hover**. **0.85s**. |
| 5 | **Elevación + glow en tarjetas** | Features, pasos | CSS `transition` + `:hover` | `translateY(-6px)`, borde lima e icono con leve rotación/escala; sombra verde suave. |
| 6 | **Reveal al hacer scroll** | Cabeceras de sección, CTA final | JS `IntersectionObserver` + `.reveal-init` | Aparición con `opacity` + `translateY(26px)` al entrar en viewport. **0.75s**. |
| 7 | **Reveal escalonado (stagger)** | Rejillas de Features, pasos, ROI | JS + `.stagger-init` | Los hijos aparecen en cascada, con retardos incrementales (~0.04s → 0.39s). |
| 8 | **Conteo animado (count-up)** | Números del hero y ROI (73, 1.248, 100…) | JS `initCounters` | Cuenta desde 0 hasta el valor al entrar en viewport. **1.2s**, easing cúbico. |
| 9 | **Barra de progreso 73%** | Tarjeta de resultados del hero | CSS `@keyframes ff-bar-fill` | La barra se rellena (`scaleX 0 → 1`) al entrar en viewport. **1.4s**. |
| 10 | **Tarjetas flotantes** | "Saved this week" / "Joined the waitlist" | CSS `@keyframes ff-float` | Flotación vertical suave (`translateY`). **6s** y **7.5s**, desfasadas. Solo en desktop (≥920px). |
| 11 | **Sparkline animada** | Tarjeta flotante "Saved this week" | CSS `@keyframes ff-spark` | Las barritas crecen (`scaleY`) con retardos escalonados. |
| 12 | **Punto pulsante** | Eyebrow "Pre-launch · Founding access" | CSS `@keyframes pulse` | Halo que late alrededor del punto lima. **2.4s** infinito. También en el bloque de escasez. |
| 13 | **Header al hacer scroll** | Barra de navegación | JS `initHeader` | Al bajar >12px, la barra gana fondo translúcido, borde y sombra (efecto "glass"). |
| 14 | **Subrayado de navegación** | Enlaces del menú | CSS `:hover` / `.is-active` | Línea lima que se despliega (`scaleX`) bajo el enlace. **0.28s**. |
| 15 | **Scrollspy (sección activa)** | Menú | JS `IntersectionObserver` | Resalta el enlace de la sección visible mientras se hace scroll. |
| 16 | **Scroll suave** | Global | CSS `scroll-behavior: smooth` | Desplazamiento suave al pulsar anclas del menú/CTA. |
| 17 | **Acordeón FAQ** | Preguntas frecuentes | HTML `<details>` + CSS | El icono "+" rota a "×" al abrir; borde lima en el ítem abierto. |
| 18 | **Switch de idioma EN/ES** | Cabecera | JS `applyLanguage` | Cambia todos los textos `data-i18n` al instante y recuerda la preferencia (`localStorage`). |

### Utilidades preparadas (aún sin usar, listas para pulir)

| Clase | Para qué sirve |
|---|---|
| `.section--gradient` | Dar a una sección un fondo con gradiente/resplandor para variar el ritmo visual. |
| `.hscroll` | Fila con **scroll-snap horizontal** (arrastrar/deslizar tarjetas), ideal para testimonios o beneficios. |
| `.reveal-left-init` / `.reveal-right-init` | Reveals **direccionales** (entrar desde la izquierda o la derecha al hacer scroll). |

---

## 13. Ideas pendientes (backlog de UI/contenido)

- [ ] Sección con **scroll horizontal "pinned"** (el contenido se mueve en horizontal al bajar).
- [ ] Reveals **direccionales** aplicados por sección.
- [ ] **Tilt 3D** en la tarjeta de resultados del hero.
- [ ] Sección de **testimonios** (usando `.hscroll`).
- [ ] **Contador social real** ("N personas ya se unieron") conectado a los inscritos reales.
- [ ] Conectar el formulario a un **CRM/email** (Brevo, Mailchimp, ConvertKit) + doble opt-in.
- [ ] Reemplazar el logo SVG reconstruido por el **asset oficial** de marca.
