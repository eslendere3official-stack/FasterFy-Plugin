# Divulgación de IA — FasterFy

> No es asesoría legal. Declaración de transparencia sobre el uso de inteligencia
> artificial en FasterFy. Muestra una versión corta en el producto y en tu privacidad.

## Versión corta (úsala en el panel y en la landing)
FasterFy usa IA de terceros para analizar imágenes y generar texto SEO (alt text, títulos,
descripciones). El resultado de la IA puede contener errores y conviene revisarlo. FasterFy
no usa tus imágenes para entrenar modelos de IA.

## Qué envía el plugin al proveedor de IA
- Al usar las funciones de IA, FasterFy envía la **imagen** (o una copia redimensionada) y
  un prompt de texto al **proveedor de IA que configures** (el "Endpoint base" y el modelo
  en *IA & SEO*). Por defecto es un endpoint compatible con OpenAI; puedes apuntarlo a
  Google Gemini, OpenAI, OpenRouter, etc.
- El proveedor devuelve texto descriptivo que FasterFy guarda en WordPress.

## Qué NO hacemos
- No vendemos tus datos.
- No usamos tus imágenes ni tu contenido para entrenar nuestros propios modelos.
- En la versión autoalojada, el plugin no envía datos a servidores de FasterFy; la única
  llamada externa es al proveedor de IA que configuraste.

## Tus responsabilidades como dueño del sitio
- Declara tu proveedor de IA como **subprocesador** en tu Política de Privacidad y firma/acepta
  su **DPA** (ej. OpenAI, Google).
- Evita enviar imágenes personales o sensibles al proveedor de IA sin base legal.
- No presentes el resultado de la IA como garantizado (nada de "100% preciso"). La FTC de
  EE.UU. trata como publicidad engañosa exagerar u ocultar capacidades de IA.

## Subprocesador (rellena el que uses)
- Proveedor: `[ej. Google Gemini API / OpenAI]`
- Finalidad: análisis de imagen + generación de texto
- DPA: `[enlace al DPA del proveedor]`
- Ubicación de datos: `[regiones del proveedor]`
