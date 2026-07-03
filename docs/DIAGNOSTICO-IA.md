# FasterFy — Guía de Diagnóstico de IA

> Documento de troubleshooting para resolver problemas con la generación de texto por IA.
> Última actualización: 1 de julio de 2026.

## 🎯 Objetivo

Esta guía te ayudará a diagnosticar **por qué la IA no está generando texto** en tu instalación de FasterFy.

---

## 📋 Checklist de Diagnóstico Rápido

Sigue estos pasos en orden. Marca ✅ cuando confirmes que está bien:

### 1. ⚙️ Configuración Básica

- [ ] **¿La IA está habilitada?**
  - Ve a FasterFy → Configuración → Pestaña "IA"
  - Verifica que el interruptor "Habilitar IA" esté activado
  - Ubicación en código: `ai.enabled` debe ser `true`

- [ ] **¿Hay API Key configurada?**
  - En la misma pestaña, verifica que el campo "API Key" tenga un valor
  - El campo muestra `••••••` si hay una clave guardada
  - Ubicación en código: `Settings::has_api_key()` debe retornar `true`

- [ ] **¿El endpoint es correcto?**
  - Campo "URL Base del API"
  - Para OpenAI: `https://api.openai.com/v1`
  - Para Google Gemini vía OpenAI-compatible: revisa el endpoint en la documentación
  - Para otros: verifica que sea compatible con la API de OpenAI (Chat Completions)

- [ ] **¿El modelo existe en tu proveedor?**
  - Campo "Modelo de Visión"
  - Predeterminado: `gpt-4o-mini`
  - Para Gemini: puede ser algo como `gemini-1.5-flash` (confirma con tu proveedor)
  - **Importante**: API gratuitas tienen modelos limitados

### 2. 🔑 Problemas Comunes con API Keys

#### Síntoma: "No hay API Key configurada"

**Causa posible**: La clave no se guardó correctamente.

**Solución**:
1. Ve a FasterFy → Configuración → IA
2. Pega tu API Key nuevamente
3. Haz clic en "Guardar cambios"
4. Verifica que aparezcan `••••••` en el campo

**Verificación técnica**:
- La clave se guarda cifrada en `wp_options` con nombre `fasterfy_settings`
- La función `Settings::get_api_key()` la descifra al usarla
- Si ves un error de cifrado, puede que las keys de WordPress (`AUTH_KEY`, `SECURE_AUTH_KEY`, etc.) no estén configuradas

#### Síntoma: "HTTP 401 Unauthorized"

**Causa posible**: API Key inválida o expirada.

**Solución**:
1. Ve al dashboard de tu proveedor de IA (OpenAI, Google AI Studio, etc.)
2. Genera una **nueva API Key**
3. Copia y pega en FasterFy
4. Guarda cambios

**Para Google Gemini**:
- Si estás usando Gemini vía endpoint OpenAI-compatible, necesitas un **proxy** o **adaptador**
- Gemini nativo NO usa el formato de OpenAI directamente
- Opciones:
  - Usar un servicio como [openrouter.ai](https://openrouter.ai/)
  - Usar [litellm-proxy](https://docs.litellm.ai/docs/proxy/quick_start)
  - Integrar directamente la API de Gemini (requiere modificar `OpenAIProvider.php`)

#### Síntoma: "HTTP 429 Too Many Requests"

**Causa posible**: Límite de tasa excedido (rate limit).

**Solución**:
- **API gratuitas** tienen límites muy estrictos (ej: 3 requests/minuto)
- Reduce el tamaño del lote en FasterFy → Configuración → Avanzado → "Tamaño de lote"
- Ponlo en **1** si tienes una API gratuita
- Espera unos minutos y vuelve a intentar

**Solución a largo plazo**:
- Actualiza a un plan de pago del proveedor
- Las APIs de pago tienen límites mucho más altos (ej: 500 requests/minuto)

### 3. 🧪 Prueba de Conexión

FasterFy incluye una **herramienta de diagnóstico** en la UI:

1. Ve a FasterFy → Configuración → Pestaña "IA"
2. Haz clic en el botón **"Probar Conexión"** (si existe en tu versión)
3. Observa el mensaje:
   - ✅ "Conexión correcta con el proveedor de IA" → Todo bien
   - ❌ "No hay API Key configurada" → Vuelve al paso 1
   - ❌ "El proveedor respondió con el código HTTP XXX" → Anota el código y ve a la sección "Códigos de Error"

**Si no ves el botón**, puedes probar manualmente:

**Opción A: Vía REST API de WordPress**

Usa una herramienta como Postman, Insomnia o curl:

```bash
curl -X GET "https://tu-sitio.com/wp-json/fasterfy/v1/health/ai" \
  -H "X-WP-Nonce: TU_NONCE_AQUI"
```

Respuesta esperada:
```json
{
  "ok": true,
  "message": "Conexión correcta con el proveedor de IA."
}
```

**Opción B: Vía Consola del Navegador**

Abre FasterFy en tu navegador, abre la Consola de JavaScript (F12), y ejecuta:

```javascript
// Ejecutar dentro del panel de FasterFy (WordPress Admin → FasterFy)
fetch(FasterFyData.restUrl + '/diagnostic/ai/connection', {
  headers: { 'X-WP-Nonce': FasterFyData.nonce }
})
.then(r => r.json())
.then(console.log);
```

### 4. 📊 Revisar los Logs

FasterFy registra todos los intentos de IA en la base de datos.

**Desde la UI**:
1. Ve a FasterFy → Registros (tab "Logs")
2. Filtra por contexto: **"ai"**
3. Observa los errores:
   - Si ves "No se encontró el archivo del adjunto" → La imagen fue borrada o movida
   - Si ves "HTTP XXX" → Ve a "Códigos de Error" abajo
   - Si ves "El modelo no devolvió una descripción utilizable" → El modelo respondió pero sin contenido útil

**Desde la base de datos**:

Conéctate a phpMyAdmin o vía terminal SQL:

```sql
SELECT * FROM wp_fasterfy_log 
WHERE context = 'ai' 
ORDER BY id DESC 
LIMIT 20;
```

Busca columnas `level = 'error'` y lee el `message`.

### 5. 🔍 Inspeccionar el Metadato de un Adjunto

Cuando la IA falla, FasterFy guarda el estado en el adjunto:

**Vía WordPress admin**:
1. Ve a Medios → Biblioteca
2. Selecciona una imagen que intentó procesarse
3. Mira la URL: anota el ID (ej: `post=1234`)

**Vía base de datos**:

```sql
SELECT post_id, meta_key, meta_value 
FROM wp_postmeta 
WHERE post_id = 1234  -- Cambia por el ID real
  AND meta_key LIKE '_fasterfy_%';
```

Campos importantes:
- `_fasterfy_ai_status`: 
  - `pending` → Esperando procesamiento
  - `done` → Completado con éxito
  - `error` → Falló (revisa logs)
  - `blocked` → Bloqueado por moderación (contenido sensible)
- `_fasterfy_ai_attempts`: Número de intentos (máx. 3)
- `_fasterfy_ai_at`: Timestamp de última ejecución

Si `_fasterfy_ai_attempts` es 3 y `_fasterfy_ai_status` es `error`, la IA agotó los reintentos.

---

## 🚨 Códigos de Error HTTP Comunes

### 400 Bad Request
**Causa**: El request está malformado.

**Diagnóstico**:
- El modelo especificado no existe en el proveedor
- El formato del JSON enviado es incorrecto
- La imagen es demasiado grande (algunos proveedores limitan a 20 MB)

**Solución**:
1. Verifica el nombre del modelo en Configuración → IA → "Modelo de Visión"
2. Prueba con un modelo diferente (ej: `gpt-4o-mini` para OpenAI, `gemini-1.5-flash` para Gemini)
3. Reduce el tamaño de la imagen de prueba

### 401 Unauthorized
**Causa**: API Key inválida o ausente.

**Solución**: Ve a la sección "Problemas Comunes con API Keys" arriba.

### 403 Forbidden
**Causa**: Tu cuenta no tiene acceso a ese modelo o endpoint.

**Solución**:
- **Para API gratuitas de Google Gemini**: Algunos modelos de visión requieren cuenta de pago
- Verifica en el dashboard del proveedor qué modelos están disponibles en tu plan
- Cambia a un modelo gratuito (ej: `gemini-1.5-flash-8b`)

### 404 Not Found
**Causa**: El endpoint no existe.

**Solución**:
1. Revisa la "URL Base del API" en Configuración → IA
2. Para OpenAI debe ser: `https://api.openai.com/v1`
3. Para otros proveedores, consulta su documentación

### 429 Too Many Requests
**Causa**: Límite de tasa excedido (rate limit).

**Solución**: Ve a "Síntoma: HTTP 429" en la sección de API Keys arriba.

### 500 Internal Server Error
**Causa**: Error del lado del proveedor de IA.

**Solución**:
- Reintenta en unos minutos
- Verifica el status del proveedor:
  - OpenAI: https://status.openai.com/
  - Google: https://status.cloud.google.com/
- Si persiste, contacta al soporte del proveedor

### 503 Service Unavailable
**Causa**: El servicio está temporalmente fuera de línea.

**Solución**: Igual que 500, espera y reintenta.

---

## 🧪 Caso de Prueba Manual

Para aislar el problema, prueba con **una sola imagen pequeña**:

### Paso 1: Prepara una imagen de prueba
- Sube una imagen JPG simple y pequeña (< 500 KB)
- Contenido: algo obvio como una manzana roja sobre fondo blanco
- Anota el ID del adjunto (lo ves en la URL de la biblioteca de medios)

### Paso 2: Procesa manualmente desde la UI
1. Ve a FasterFy → Galería
2. Busca la imagen que acabas de subir
3. Haz clic en **"Procesar IA"** (o selecciona y usa "Acciones masivas" → "Procesar IA")
4. Observa:
   - ¿Aparece una notificación de éxito o error?
   - ¿Se actualiza el alt text de la imagen?

### Paso 3: Revisa el resultado
- Ve a Medios → Biblioteca → Editar la imagen
- ¿Tiene alt text nuevo? (campo "Texto alternativo")
- Si sí → ¡Funciona! El problema es de configuración por lotes
- Si no → Ve al paso 4

### Paso 4: Revisa los logs
- FasterFy → Registros → Filtra por contexto "ai"
- Busca la entrada más reciente relacionada con el ID de tu imagen de prueba
- Anota el mensaje de error exacto

### Paso 5: Verifica la metadata
```sql
SELECT meta_key, meta_value 
FROM wp_postmeta 
WHERE post_id = TU_ID_DE_ADJUNTO
  AND (meta_key = '_wp_attachment_image_alt' 
    OR meta_key LIKE '_fasterfy_%');
```

Si `_wp_attachment_image_alt` está vacío pero `_fasterfy_ai_status = 'done'`, hay un bug en la inyección.

---

## 🔧 Problemas Específicos de Proveedores

### Google Gemini (Gratis)

**Problema común**: Gemini no es directamente compatible con la API de OpenAI.

**Soluciones**:

#### Opción 1: Usar OpenRouter (Recomendado)
[OpenRouter](https://openrouter.ai/) es un proxy que convierte la API de Gemini al formato de OpenAI:

1. Regístrate en https://openrouter.ai/
2. Obtén tu API Key
3. En FasterFy → Configuración → IA:
   - URL Base: `https://openrouter.ai/api/v1`
   - API Key: Tu key de OpenRouter
   - Modelo: `google/gemini-flash-1.5-8b` (gratis)

#### Opción 2: Usar LiteLLM Proxy (Autoalojado)
Si prefieres no depender de un tercero:

1. Instala LiteLLM en un servidor:
   ```bash
   pip install litellm[proxy]
   litellm --model gemini/gemini-1.5-flash-8b --api_key TU_KEY_DE_GEMINI
   ```
2. En FasterFy → Configuración → IA:
   - URL Base: `http://tu-servidor:4000/v1`
   - API Key: Cualquier string (el proxy usa tu key de Gemini internamente)
   - Modelo: `gemini-1.5-flash-8b`

#### Opción 3: Modificar el Proveedor (Técnico)
Crear un `GeminiProvider.php` que use directamente la API de Gemini (requiere desarrollo).

### OpenAI (Gratis)

**Problema**: OpenAI **NO tiene plan gratuito** desde 2023.

**Límite de la cuenta gratuita (trial)**:
- $5 USD de crédito inicial (expira en 3 meses)
- Rate limit: ~3 requests/minuto

**Solución**:
- Añade un método de pago para obtener límites más altos
- O cambia a un proveedor con plan gratuito (Gemini, Groq, etc.)

### Otros Proveedores OpenAI-Compatible

**Proveedores probados con FasterFy**:
- ✅ **OpenRouter**: Funciona, soporta múltiples modelos
- ✅ **Groq**: Rápido, modelos de código abierto gratis (llama-vision)
- ✅ **Together AI**: Modelos open source, plan gratuito limitado
- ✅ **LocalAI**: Autoalojado, gratis, requiere GPU potente

**Para configurar cualquiera**:
1. Obtén API Key del proveedor
2. Consulta su documentación para:
   - URL base del endpoint
   - Nombres exactos de los modelos de visión
3. Configura en FasterFy → IA

---

## 📝 Información para Reportar Bugs

Si después de seguir esta guía el problema persiste, **recopila la siguiente información** antes de reportar:

### 1. Configuración
- Versión de FasterFy (ve a Plugins → FasterFy)
- Versión de WordPress
- Versión de PHP (ve a Herramientas → Salud del sitio)
- Proveedor de IA usado (OpenAI, Gemini, OpenRouter, etc.)
- Plan del proveedor (gratis, pago)

### 2. Configuración de IA
- URL Base del API (oculta tu API Key, nunca la compartas)
- Modelo de Visión configurado
- Idioma seleccionado
- ¿Moderación habilitada?

### 3. Logs
- Copia los últimos 5 errores de contexto "ai" desde FasterFy → Registros
- O exporta desde la base de datos:
  ```sql
  SELECT level, message, meta, created_at 
  FROM wp_fasterfy_log 
  WHERE context = 'ai' AND level = 'error'
  ORDER BY id DESC 
  LIMIT 5;
  ```

### 4. Metadatos de un adjunto fallido
```sql
SELECT meta_key, meta_value 
FROM wp_postmeta 
WHERE post_id = ID_DEL_ADJUNTO
  AND meta_key LIKE '_fasterfy_%';
```

### 5. Respuesta del proveedor (si es posible)
Si tienes acceso a los logs del servidor (error_log de PHP), busca la respuesta completa del proveedor de IA.

---

## 🎯 Resumen: ¿Por qué puede fallar la IA?

| Causa | Síntoma | Solución rápida |
|-------|---------|-----------------|
| **IA deshabilitada** | No procesa nada | Habilitar en Configuración → IA |
| **Sin API Key** | Error "No configurada" | Pegar key y guardar |
| **API Key inválida** | HTTP 401 | Generar nueva key del proveedor |
| **Modelo inexistente** | HTTP 400 o 404 | Cambiar modelo en configuración |
| **Rate limit excedido** | HTTP 429 | Reducir tamaño de lote a 1 |
| **Plan gratis agotado** | HTTP 403 o 429 | Actualizar a plan de pago |
| **Endpoint incorrecto** | HTTP 404 | Verificar URL base del API |
| **Proveedor caído** | HTTP 500/503 | Esperar y reintentar |
| **Imagen corrupta** | Error en logs | Probar con imagen diferente |
| **Gemini sin proxy** | HTTP 400 o 404 | Usar OpenRouter o LiteLLM |

---

## ✅ Próximos Pasos

Una vez identificado el problema:

1. **Si es de configuración**: Ajusta en FasterFy → Configuración → IA
2. **Si es del proveedor**: Cambia a otro proveedor o actualiza tu plan
3. **Si es un bug del plugin**: Reporta con la información de arriba

**¿Necesitas ayuda para diagnosticar?** Comparte:
- El proveedor de IA que estás usando
- Si es gratis o de pago
- El mensaje de error exacto de los logs de FasterFy

---

**Última actualización**: 1 de julio de 2026  
**Versión del plugin**: 1.0.17
