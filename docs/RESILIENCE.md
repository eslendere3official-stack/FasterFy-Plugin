# FasterFy — Resiliencia, escalabilidad y escenarios de fallo

> Documento de prevención: qué puede romper el plugin, por qué, y cómo lo evitamos.
> Estado: ✅ mitigado · 🟡 parcial · ⬜ pendiente.

## Aclaración de escala (importante)
FasterFy es hoy un **plugin autoalojado**: cada cliente lo instala en SU WordPress.
Por eso "100 personas a la vez" se interpreta en dos planos distintos:

1. **Un sitio procesando lotes grandes** (cientos/miles de fotos) — es el caso real hoy.
2. **El futuro SaaS en la nube** (registro/cobro central, API key en tu servidor) —
   ahí sí hay "100 registros simultáneos" y se resuelve con infraestructura, no con el plugin.

---

## A) Escenarios en un sitio (procesamiento de lotes grandes)

### 1. Timeout de PHP / HTTP a mitad de un lote 🟡→✅
- **Riesgo**: cada imagen (conversión + miniaturas + IA) tarda; si una petición procesa
  demasiadas, supera `max_execution_time` (30 s en hosts compartidos) → error 500.
- **Prevención aplicada**: el navegador conduce los lotes (`run_batch`), con **límite de
  ítems por tick** (3 con IA) y **presupuesto de tiempo de ~20 s** que corta el bucle y
  continúa en el siguiente tick.
- **Pendiente** ⬜: límite adaptativo según la velocidad real del host.

### 2. Memoria agotada con imágenes enormes (Imagick/GD) 🟡
- **Riesgo**: una imagen de 6000×6000 puede consumir cientos de MB; varias por petición
  superan `memory_limit` → fatal.
- **Prevención aplicada**: se procesa de a pocas por tick; el motor libera memoria
  (`clear/destroy`) y captura excepciones por imagen.
- **Pendiente** ⬜: detectar dimensiones/peso antes de procesar y saltar o redimensionar
  preventivamente; fijar `Imagick::setResourceLimit`.

### 3. Concurrencia: dos pestañas o WP-Cron procesando a la vez ✅
- **Riesgo**: estado de cola corrupto, contadores erróneos, doble procesamiento o doble
  cobro de IA.
- **Prevención aplicada**: **bloqueo (lock) con auto-expiración** en `run_batch`; si otro
  proceso trabaja, la petición no procesa y reintenta. Además, no se reprocesa IA ya hecha.

### 4. Límite de velocidad / cuota del proveedor de IA (429) 🟡
- **Riesgo**: lotes grandes disparan 429; o facturas altas inesperadas.
- **Prevención aplicada**: reintentos (hasta 3) por imagen, throttling configurable
  (tamaño de lote, enfriamiento), control de cuota mensual con pausa.
- **Pendiente** ⬜: respetar `Retry-After` y backoff exponencial ante 429.

### 5. Coste de regenerar miniaturas ✅/🟡
- **Riesgo**: `wp_generate_attachment_metadata` regenera todos los tamaños por imagen
  (pesado en lotes grandes).
- **Prevención**: forma parte del coste por ítem, acotado por el presupuesto de tiempo.

### 6. Carga de base de datos en bibliotecas enormes 🟡
- **Riesgo**: las consultas del escáner usan varios JOIN sobre `postmeta`; con millones de
  filas pueden ser lentas, y se cuenta en cada tick.
- **Pendiente** ⬜: cachear los conteos (transient) y refrescarlos cada X segundos en vez
  de en cada tick.

### 7. Espacio en disco por los respaldos 🟡
- **Riesgo**: el respaldo duplica almacenamiento (original + optimizado + miniaturas);
  miles de imágenes pueden llenar el disco → fallos de escritura.
- **Prevención**: se muestra el tamaño total de respaldos en el panel.
- **Pendiente** ⬜: comprobar espacio antes de respaldar; opción de auto-purga de respaldos
  por antigüedad; opción de "no respaldar".

### 8. Caducidad del nonce en sesiones largas ⬜
- **Riesgo**: un lote de horas puede superar la vida del nonce → 403 y se detiene.
- **Pendiente** ⬜: refrescar el nonce automáticamente o reintentar al detectar 403.

### 9. Pestaña cerrada a mitad del lote 🟡
- **Riesgo/Realidad**: como el navegador conduce, cerrar la pestaña pausa el avance.
- **Prevención**: el estado persiste; al volver, se retoma. **Pendiente** ⬜: opción de
  fondo real vía Action Scheduler para quien lo tenga.

### 10. Imágenes corruptas / formatos raros (CMYK, GIF animado) ✅/🟡
- **Prevención**: el motor captura errores por imagen y continúa; si no hay ahorro real,
  conserva el original.

### 11. Conflictos con otros plugins (Smush, ShortPixel, Jetpack, CDN/WebP) ⬜
- **Riesgo**: doble optimización o URLs rotas.
- **Pendiente** ⬜: detectar plugins conocidos y avisar.

### 12. Multisitio (WordPress Multisite) ⬜
- **Riesgo**: rutas de uploads distintas por sitio; no probado.
- **Pendiente** ⬜: validar y dar soporte explícito.

---

## B) Escenarios del futuro SaaS en la nube (100+ usuarios simultáneos)
Esto NO se resuelve en el plugin, sino en tu infraestructura central:
- ⬜ **Cobro/registro**: usa Stripe/Freemius/Lemon Squeezy (ya escalan); tu servidor de
  licencias debe escalar (serverless/autoscaling).
- ⬜ **Procesamiento de IA centralizado**: cola de trabajos con workers, límites de
  concurrencia por cuenta, idempotencia, reintentos con backoff.
- ⬜ **Rate limiting por cuenta** y protección anti-abuso en la API.
- ⬜ **Observabilidad**: métricas, logs centralizados y alertas.
- ⬜ **Idempotencia**: claves para no procesar dos veces el mismo asset.
- ⬜ **Pruebas de carga** antes de campañas (simular 100+ concurrentes).

---

## Backlog de endurecimiento priorizado
1. Backoff ante 429 del proveedor de IA (respeta Retry-After).
2. Cachear conteos del escáner (transient) para bibliotecas grandes.
3. Guardas de memoria/dimensiones antes de procesar imágenes muy grandes.
4. Comprobación de espacio en disco + auto-purga de respaldos.
5. Refresco automático del nonce en lotes largos.
6. Detección de plugins de optimización en conflicto.
7. Soporte/validación de Multisite.
8. Pruebas de carga (cuando exista la capa SaaS).
