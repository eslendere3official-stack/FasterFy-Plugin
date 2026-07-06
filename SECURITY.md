# Política y Auditoría de Seguridad — FasterFy

> Documento de seguridad del plugin **FasterFy — Pro Media Optimizer**.
> Última auditoría: v1.0.29. Ámbito: código del plugin (carpeta raíz + `includes/` + `admin/`).

---

## 1. Reporte de vulnerabilidades

Si descubres una vulnerabilidad de seguridad, por favor repórtala de forma responsable:

- **No** abras un issue público con los detalles del fallo.
- Contacta en privado al mantenedor (a través del repositorio) con:
  - Descripción del problema y su impacto.
  - Pasos para reproducirlo.
  - Versión afectada.
- Nos comprometemos a acusar recibo y a trabajar en una corrección con prioridad.

### Versiones soportadas

| Versión | Soporte de seguridad |
|---------|----------------------|
| 1.0.x (última) | ✅ |
| Anteriores | Actualiza a la última |

---

## 2. Principios de seguridad del plugin

FasterFy sigue las prácticas recomendadas del **WordPress Plugin Handbook**:

- **Nunca confiar en la entrada**: todo dato externo se valida y sanea.
- **Escapar en la salida**: todo dato dinámico se escapa según su contexto.
- **Autenticación y autorización**: cada acción sensible verifica capacidad de usuario y nonce.
- **Secretos cifrados en reposo**: las claves de API nunca se exponen ni se guardan en claro.
- **No destructivo**: se respalda el original antes de cualquier mutación.
- **Menor superficie**: assets y endpoints solo donde se necesitan.

---

## 3. Auditoría contra checklist de buenas prácticas

Estado del código verificado línea a línea.

| # | Área | Estado | Implementación |
|---|------|--------|----------------|
| 1 | **SQL Injection** | ✅ | Todas las consultas con variables usan `$wpdb->prepare()`. Las cláusulas `IN (...)` se construyen desde una **lista blanca interna** de tipos MIME, no desde input del usuario. |
| 2 | **XSS (escape de salida)** | ✅ | La vista PHP usa `esc_html__()`. El panel (SPA) escapa el dato dinámico del usuario con un helper `h()` y usa `textContent` para mensajes. |
| 3 | **CSRF** | ✅ | La API REST valida `X-WP-Nonce` (`wp_rest`) y un `permission_callback` por ruta. |
| 4 | **Capabilities** | ✅ | `current_user_can('manage_options')` en todas las rutas REST de gestión. |
| 5 | **AJAX protegido** | ✅ | Se usa la **REST API** (no `admin-ajax`) con nonce + capacidad + saneado. |
| 6 | **LFI (inclusión de archivos)** | ✅ | La vista se incluye desde una ruta fija (`FASTERFY_PATH`); no hay `include`/`require` dinámicos con input. |
| 7 | **Datos sensibles en JS** | ✅ | La API Key **nunca** se envía al frontend (`Settings::for_frontend()` la vacía) y se **cifra en reposo** (AES-256-CBC con las llaves de WordPress). |
| 8 | **Uploads** | ✅ | `wp_check_filetype()` para el tipo MIME. Los SVG se **sanean** (ver §4). |
| 9 | **Queries preparadas** | ✅ | Ver punto 1. |
| 10 | **Tablas** | ✅ | `dbDelta()` + `$wpdb->prefix` + `$wpdb->get_charset_collate()`. |
| 11 | **APIs nativas** | ✅ | `get_option`/`update_option`/`get_post_meta`/`update_post_meta`. |
| 12 | **Sanitización al guardar** | ✅ | `Settings::sanitize()` sanea todos los campos antes de persistir. |
| 13 | **Charset** | ✅ | `utf8mb4` vía `get_charset_collate()`. |
| 14 | **Assets condicionales** | ✅ | CSS/JS se encolan solo en la página del plugin (comprobación de `hook_suffix`). |
| 15 | **Estructura** | ✅ | Separación OOP de SQL, lógica y presentación. |
| 16 | **Prefijos** | ✅ | Namespace `FasterFy\`; opciones, hooks y tablas con prefijo `fasterfy_`. |
| 17 | **i18n** | 🟡 | PHP con `__( ..., 'fasterfy' )`. El panel (JS) se internacionaliza en la fase pre-lanzamiento (ver §5). |
| 18 | **HTTP API** | ✅ | `wp_remote_get()`/`wp_remote_post()` para la IA. `file_get_contents` solo sobre **archivos locales** (imágenes), no URLs. |
| 19 | **Rutas** | ✅ | `plugin_dir_path()`, `wp_upload_dir()`. |
| 20 | **Errores** | ✅ | Logger propio en tabla; no se imprimen errores ni trazas en pantalla. |
| 21 | **Validación de input** | ✅ | Parámetros REST casteados (`absint`, `(int)`, `(string)`); `orderby`/`status`/`date` mediante **lista blanca** (sin concatenación en SQL). |
| 22 | **Sin `extract()` / global excesivo** | ✅ | No se usa `extract()` ni `eval()`; `global $wpdb` acotado. |
| 23 | **Ciclo de vida** | ✅ | `Activator`/`Deactivator`/`uninstall.php` con guarda `WP_UNINSTALL_PLUGIN`. `unserialize()` con `allowed_classes => false`. |

**Resultado: 22/23 cubiertos; 1 en curso (i18n, planificado para pre-lanzamiento).**

---

## 4. Controles de seguridad destacados

### 4.1 Sanitización de SVG (anti-XSS y anti-XXE)
El `SvgSanitizer` procesa los SVG con `DOMDocument` y:
- Elimina elementos `<script>` y atributos de evento (`on*`).
- Neutraliza `javascript:` y `data:text/html` en atributos y `href`/`xlink:href`.
- **Previene XXE**: elimina el `DOCTYPE`, usa `LIBXML_NONET` y desactiva la carga de entidades externas.

### 4.2 Cifrado de secretos en reposo
La API Key del proveedor de IA se cifra con **AES-256-CBC**, derivando la clave de las *security keys* de WordPress (`AUTH_KEY`, `SECURE_AUTH_SALT`, `LOGGED_IN_KEY`). Nunca se expone al navegador.

### 4.3 Arquitectura no destructiva
Antes de optimizar, el original se respalda en `wp-content/uploads/fasterfy-backups`, un directorio protegido con `.htaccess` (`Deny from all`, `Options -Indexes`) e `index.php`. Permite revertir con un clic.

### 4.4 Manejo seguro de datos serializados
La reescritura de referencias en `postmeta` deserializa con `allowed_classes => false`, evitando la inyección de objetos PHP (PHP Object Injection).

### 4.5 Procesamiento en segundo plano autenticado
El worker de segundo plano expone un endpoint REST autenticado por **token secreto** (comparación con `hash_equals`), no por sesión, ya que lo invoca el propio servidor (loopback).

---

## 5. Endurecimiento pendiente (roadmap pre-lanzamiento)

Ninguno de estos puntos es una vulnerabilidad; son mejoras de robustez para la versión comercial:

- [ ] **Internacionalización del panel (JS)**: migrar cadenas a `wp.i18n` + `wp_set_script_translations()` y generar `fasterfy.pot` + `es_ES`.
- [ ] **Esquemas `args` en REST**: declarar `sanitize_callback`/`validate_callback` por parámetro (defensa en profundidad; hoy ya se castean en el handler).
- [ ] **Refresco automático de nonce** en sesiones/lotes muy largos (fiabilidad).
- [ ] **Pruebas automatizadas de seguridad** (PHPCS con `WordPress-Extra`, análisis estático) en CI.

---

## 6. Historial de auditorías

| Fecha | Versión | Notas |
|-------|---------|-------|
| 2026-07 | 1.0.29 | Auditoría completa contra checklist de 23 puntos (22/23 ✅). Corrección: `DEFAULT` de la columna `created_at` cambiado a `CURRENT_TIMESTAMP` para compatibilidad con MySQL 8 / modo estricto. |

---

*Este documento resume el estado de seguridad del plugin con fines de transparencia y confianza. No sustituye una auditoría de seguridad profesional externa, recomendable antes de un lanzamiento comercial a gran escala.*
