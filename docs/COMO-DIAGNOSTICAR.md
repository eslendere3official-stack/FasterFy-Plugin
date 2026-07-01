# Cómo Diagnosticar Tu Problema de IA — Guía Rápida

> **Síntoma**: La IA no genera texto para las imágenes.
> **Objetivo**: Encontrar la causa exacta en menos de 5 minutos.

---

## 🚀 Opción 1: Diagnóstico Automático via REST API (Recomendado)

La forma más rápida es usar los endpoints de diagnóstico que acabamos de añadir.

### Paso 1: Abre la Consola del Navegador

1. Ve a tu sitio WordPress → FasterFy (cualquier pestaña del plugin)
2. Presiona **F12** para abrir las Herramientas de Desarrollador
3. Ve a la pestaña **"Console"** (Consola)

### Paso 2: Ejecuta el Diagnóstico de Configuración

Copia y pega este código en la consola:

```javascript
fetch('/wp-json/fasterfy/v1/diagnostic/ai', {
  headers: { 'X-WP-Nonce': window.fasterfy.nonce }
})
.then(r => r.json())
.then(report => {
  console.log('=== REPORTE DE DIAGNÓSTICO ===');
  console.log('');
  
  // IA Habilitada
  console.log(`🔧 IA Habilitada: ${report.ai_enabled.status === 'ok' ? '✅' : '❌'}`);
  console.log(`   ${report.ai_enabled.message}`);
  console.log('');
  
  // API Key
  console.log(`🔑 API Key: ${report.api_key.status === 'ok' ? '✅' : '❌'}`);
  console.log(`   ${report.api_key.message}`);
  console.log('');
  
  // URL Base
  console.log(`🌐 URL Base: ${report.api_base.status === 'ok' ? '✅' : '⚠️'}`);
  console.log(`   ${report.api_base.message}`);
  console.log('');
  
  // Modelo
  console.log(`🤖 Modelo: ${report.vision_model.status === 'ok' ? '✅' : '⚠️'}`);
  console.log(`   ${report.vision_model.message}`);
  console.log('');
  
  // Idioma
  console.log(`🌍 Idioma: ${report.language.value}`);
  console.log('');
  
  // Temperatura
  console.log(`🌡️ Temperatura: ${report.temperature.status === 'ok' ? '✅' : '⚠️'}`);
  console.log(`   ${report.temperature.message}`);
  console.log('');
  
  // Opciones de generación
  console.log(`📝 Opciones de Generación: ${report.generation_options.status === 'ok' ? '✅' : '⚠️'}`);
  console.log(`   - Generar Alt: ${report.generation_options.generate_alt ? 'SÍ' : 'NO'}`);
  console.log(`   - Generar Título: ${report.generation_options.generate_title ? 'SÍ' : 'NO'}`);
  console.log(`   - Generar Descripción: ${report.generation_options.generate_description ? 'SÍ' : 'NO'}`);
  console.log(`   - Renombrado Semántico: ${report.generation_options.semantic_rename ? 'SÍ' : 'NO'}`);
  console.log('');
  
  // Moderación
  console.log(`🛡️ Moderación: ${report.moderation.enabled ? 'Habilitada' : 'Deshabilitada'}`);
  console.log('');
  
  // Estado General
  console.log(`📊 ESTADO GENERAL: ${report.overall.status === 'ok' ? '✅ LISTO' : '❌ CONFIGURACIÓN INCOMPLETA'}`);
  console.log(`   ${report.overall.message}`);
  console.log('');
  
  // Reporte completo (para copiar y pegar si reportas un bug)
  console.log('=== REPORTE COMPLETO (JSON) ===');
  console.log(JSON.stringify(report, null, 2));
});
```

### Paso 3: Lee el Resultado

La consola mostrará algo como esto:

```
=== REPORTE DE DIAGNÓSTICO ===

🔧 IA Habilitada: ✅
   La IA está habilitada en la configuración.

🔑 API Key: ✅
   Hay una API Key configurada (cifrada).

🌐 URL Base: ✅
   URL base configurada: https://api.openai.com/v1

🤖 Modelo: ✅
   Modelo de visión: gpt-4o-mini

🌍 Idioma: es

🌡️ Temperatura: ✅
   Temperatura: 0.10 (óptimo para descripciones factuales).

📝 Opciones de Generación: ✅
   - Generar Alt: SÍ
   - Generar Título: NO
   - Generar Descripción: NO
   - Renombrado Semántico: NO

🛡️ Moderación: Deshabilitada

📊 ESTADO GENERAL: ✅ LISTO
   ✅ Configuración básica completa. Prueba la conexión con GET /diagnostic/ai/connection
```

**¿Ves algún ❌?** → Eso es lo que hay que arreglar primero.

---

### Paso 4: Prueba la Conexión Real con el Proveedor

Si el paso anterior salió todo ✅, ahora prueba si puedes conectarte realmente al proveedor de IA:

```javascript
fetch('/wp-json/fasterfy/v1/diagnostic/ai/connection', {
  headers: { 'X-WP-Nonce': window.fasterfy.nonce }
})
.then(r => r.json())
.then(result => {
  console.log('=== PRUEBA DE CONEXIÓN ===');
  console.log('');
  console.log(`Estado: ${result.ok ? '✅ CONECTADO' : '❌ FALLO'}`);
  console.log(`Mensaje: ${result.message}`);
  console.log('');
  console.log('Detalles:');
  console.log(`  API Base: ${result.details.api_base}`);
  console.log(`  Modelo: ${result.details.vision_model}`);
  console.log(`  Endpoint probado: ${result.details.test_endpoint}`);
  console.log('');
  if (!result.ok) {
    console.error('⚠️ PROBLEMA DETECTADO:');
    console.error('La API Key o el endpoint pueden ser incorrectos.');
    console.error('Revisa docs/DIAGNOSTICO-IA.md para más ayuda.');
  }
});
```

**Resultado esperado:**

```
=== PRUEBA DE CONEXIÓN ===

Estado: ✅ CONECTADO
Mensaje: Conexión correcta con el proveedor de IA.

Detalles:
  API Base: https://api.openai.com/v1
  Modelo: gpt-4o-mini
  Endpoint probado: GET /models (lista de modelos disponibles)
```

**Si ves ❌ FALLO**, anota el mensaje de error y ve a la sección correspondiente en `docs/DIAGNOSTICO-IA.md`.

---

## 🔍 Opción 2: Revisar Manualmente los Logs

Si prefieres ver directamente qué está fallando:

### Paso 1: Ve a FasterFy → Registros

1. En el panel de WordPress, abre **FasterFy**
2. Ve a la pestaña **"Registros"** (Logs)
3. En el filtro de **Contexto**, selecciona: **"ai"**
4. Haz clic en **"Filtrar"** o **"Buscar"**

### Paso 2: Busca Entradas con Nivel "error"

Revisa los mensajes en rojo (errores). Los más comunes:

| Mensaje en el log | Causa probable | Solución |
|-------------------|----------------|----------|
| "No hay API Key configurada" | API Key vacía o mal guardada | Ve a Configuración → IA y pega tu key nuevamente |
| "HTTP 401" | API Key inválida | Genera una nueva key del proveedor |
| "HTTP 429" | Rate limit excedido (demasiadas peticiones) | Reduce tamaño de lote a 1, espera unos minutos |
| "HTTP 400" | Modelo inexistente o request malformado | Verifica el nombre del modelo en Configuración → IA |
| "HTTP 403" | No tienes acceso a ese modelo | Tu plan (gratis) no incluye ese modelo; cámbialo |
| "HTTP 404" | Endpoint no existe | Verifica la URL Base en Configuración → IA |
| "No se encontró el archivo del adjunto" | La imagen fue borrada o movida | Prueba con otra imagen |
| "El modelo no devolvió una descripción utilizable" | El modelo respondió vacío | Puede ser un problema del proveedor; reintenta |

---

## 📝 Opción 3: Revisar la Metadata de una Imagen Específica

Si una imagen en particular no se procesó:

### Vía phpMyAdmin o línea de comandos SQL:

```sql
-- Cambia 1234 por el ID real de tu imagen
SELECT meta_key, meta_value 
FROM wp_postmeta 
WHERE post_id = 1234
  AND meta_key LIKE '_fasterfy_%';
```

**Campos importantes:**

- `_fasterfy_ai_status`:
  - `pending` → No se ha procesado aún
  - `done` → Completado con éxito ✅
  - `error` → Falló ❌ (ve a logs)
  - `blocked` → Bloqueado por moderación (contenido sensible)

- `_fasterfy_ai_attempts`: Número de intentos (máx. 3)
  - Si es **3** y el status es **error**, agotó los reintentos → revisa logs

- `_fasterfy_ai_at`: Fecha/hora del último intento

---

## 🎯 Los 3 Problemas Más Comunes

### 1. ❌ API Key Incorrecta o Sin Guardar

**Síntomas:**
- Diagnóstico muestra `🔑 API Key: ❌`
- Logs dicen "No hay API Key configurada"

**Solución:**
1. Ve a **FasterFy → Configuración → Pestaña IA**
2. Pega tu API Key en el campo
3. Haz clic en **"Guardar cambios"**
4. Verifica que el campo ahora muestre `••••••`

---

### 2. ❌ Estás Usando Gemini sin Proxy

**Síntomas:**
- Configuraste Gemini (Google AI Studio)
- Pusiste la URL: `https://generativelanguage.googleapis.com/v1`
- Logs muestran HTTP 400 o 404

**Causa:**
Gemini **NO es compatible directamente** con la API de OpenAI. FasterFy usa el protocolo de OpenAI.

**Solución Rápida — Usa OpenRouter:**

1. Regístrate gratis en https://openrouter.ai/
2. Crea una API Key en el dashboard
3. En **FasterFy → Configuración → IA**:
   - **URL Base**: `https://openrouter.ai/api/v1`
   - **API Key**: Tu key de OpenRouter
   - **Modelo**: `google/gemini-flash-1.5-8b` (gratis)
4. Guarda cambios
5. Ejecuta el diagnóstico de conexión (Paso 4 arriba)

**Otras opciones:**
- LiteLLM (autoalojado) — ver `docs/DIAGNOSTICO-IA.md`
- Usar OpenAI directamente (requiere método de pago, pero funciona out-of-the-box)

---

### 3. ❌ Rate Limit Excedido (HTTP 429)

**Síntomas:**
- Las primeras 2-3 imágenes se procesan bien
- Después empiezan a fallar con HTTP 429
- Logs dicen "Too Many Requests"

**Causa:**
Las **APIs gratuitas** tienen límites muy bajos:
- OpenAI trial: ~3 requests/minuto
- Gemini via OpenRouter (gratis): ~10 requests/minuto
- Groq (gratis): ~30 requests/minuto

**Solución Inmediata:**

1. Ve a **FasterFy → Configuración → Avanzado**
2. Cambia **"Tamaño de lote"** a: **1**
3. Cambia **"Intervalo entre lotes"** a: **30** segundos
4. Guarda cambios
5. Vuelve a la cola y reanuda

**Solución a Largo Plazo:**
- Actualiza a un plan de pago del proveedor
- Las APIs de pago tienen límites mucho más altos (500-1000 requests/minuto)

---

## 📋 Checklist Final

Antes de reportar un bug o pedir ayuda, confirma que:

- [ ] La IA está habilitada (Configuración → IA → Interruptor ON)
- [ ] Hay una API Key guardada (campo muestra `••••••`)
- [ ] El endpoint es correcto para tu proveedor
- [ ] El modelo existe en tu plan del proveedor
- [ ] Ejecutaste el diagnóstico automático (Opción 1)
- [ ] Probaste la conexión real (Paso 4)
- [ ] Revisaste los logs filtrando por contexto "ai"
- [ ] Probaste con **una sola imagen simple** (JPG pequeño, < 500 KB)

---

## 🆘 Si Aún No Funciona

**Comparte esta información:**

1. **Proveedor de IA que usas**: (OpenAI / Gemini / OpenRouter / Groq / Otro)
2. **Plan**: (Gratis / Pago)
3. **Resultado del diagnóstico automático** (copia el JSON de la consola)
4. **Resultado de la prueba de conexión** (copia el mensaje)
5. **Los últimos 3 errores del log** (FasterFy → Registros → Contexto: "ai")

Con esa información podremos identificar exactamente qué está fallando.

---

## ✅ Próximo Paso Si Todo Funciona

Si el diagnóstico salió **todo verde** (✅) pero aún no ves texto generado:

1. Ve a **FasterFy → Galería**
2. Sube una **imagen de prueba nueva** (JPG, < 500 KB, contenido obvio como "manzana roja")
3. Selecciona la imagen
4. Haz clic en **"Procesar IA"** (o **Acciones masivas → Procesar IA**)
5. Espera 10-20 segundos
6. Ve a **Medios → Biblioteca** → Editar esa imagen
7. Revisa el campo **"Texto alternativo"**

**¿Tiene texto?** → ¡Funciona! 🎉  
**¿Sigue vacío?** → Ve a **FasterFy → Registros → Contexto: "ai"** y anota el error

---

**Última actualización**: 1 de julio de 2026  
**Versión del plugin**: 1.0.17+

---

**Siguiente lectura**: [`docs/DIAGNOSTICO-IA.md`](DIAGNOSTICO-IA.md) — Guía completa de troubleshooting con todos los códigos de error y soluciones avanzadas.
