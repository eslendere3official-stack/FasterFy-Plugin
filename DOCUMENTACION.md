# FasterFy — Índice Maestro de Documentación

> Guía de navegación para toda la documentación del proyecto.
> Última actualización: v1.0.17 (1 de julio de 2026).

## 🎯 ¿Por dónde empezar?

### Si eres nuevo en el proyecto
Empieza aquí en orden:
1. **[docs/RESUMEN-EJECUTIVO.md](docs/RESUMEN-EJECUTIVO.md)** → Vista rápida de todo (10 min)
2. **[CONTEXT.md](CONTEXT.md)** → Arquitectura, decisiones, negocio (20 min)
3. **[docs/PROGRESS.md](docs/PROGRESS.md)** → Historial de versiones y estado funcional (5 min)

### Si retomas después de un tiempo
1. **[docs/RESUMEN-EJECUTIVO.md](docs/RESUMEN-EJECUTIVO.md)** → Ponerse al día rápidamente
2. **[readme.txt](readme.txt)** → Ver changelog técnico reciente
3. **[docs/PROGRESS.md](docs/PROGRESS.md)** → Confirmar versión actual y próximos pasos

### Si estás implementando una función
1. **[CONTEXT.md](CONTEXT.md)** → Ver backlog y decisiones de diseño
2. **[docs/RESILIENCE.md](docs/RESILIENCE.md)** → Entender escenarios de fallo
3. Código fuente en `includes/` → Ver implementación actual

## 📚 Estructura de la Documentación

### Documentos Principales

| Documento | Propósito | Cuándo leerlo |
|-----------|-----------|---------------|
| **[DOCUMENTACION.md](DOCUMENTACION.md)** | Este índice maestro | Siempre al empezar |
| **[docs/RESUMEN-EJECUTIVO.md](docs/RESUMEN-EJECUTIVO.md)** | Vista panorámica del proyecto completo | Primera lectura o después de pausa larga |
| **[CONTEXT.md](CONTEXT.md)** | Arquitectura, decisiones, negocio, backlog | Antes de implementar cambios |
| **[docs/PROGRESS.md](docs/PROGRESS.md)** | Historial de versiones y estado funcional | Antes de planificar nuevas versiones |
| **[readme.txt](readme.txt)** | Changelog técnico detallado | Para ver cambios específicos por versión |

### Documentos Técnicos

| Documento | Propósito | Cuándo leerlo |
|-----------|-----------|---------------|
| **[docs/RESILIENCE.md](docs/RESILIENCE.md)** | Escenarios de fallo y prevención | Antes de endurecimiento técnico |
| **[composer.json](composer.json)** | Configuración PSR-4 y dependencias | Al modificar estructura de archivos |

### Documentación Legal

| Documento | Propósito | Idioma |
|-----------|-----------|--------|
| **[legal/README.md](legal/README.md)** | Índice del kit legal SaaS | EN |
| **[legal/COMPLIANCE-CHECKLIST.md](legal/COMPLIANCE-CHECKLIST.md)** | Checklist de cumplimiento con estado | EN |
| **[legal/TERMS-OF-SERVICE-TEMPLATE.md](legal/TERMS-OF-SERVICE-TEMPLATE.md)** | Plantilla de Términos de Servicio | EN |
| **[legal/PRIVACY-POLICY-TEMPLATE.md](legal/PRIVACY-POLICY-TEMPLATE.md)** | Plantilla de Política de Privacidad | EN |
| **[legal/AI-DISCLOSURE.md](legal/AI-DISCLOSURE.md)** | Divulgación de uso de IA | EN |
| **[legal/es/DIVULGACION-IA.md](legal/es/DIVULGACION-IA.md)** | Divulgación de uso de IA | ES |
| **[legal/es/TERMINOS-DE-SERVICIO-PLANTILLA.md](legal/es/TERMINOS-DE-SERVICIO-PLANTILLA.md)** | Plantilla de Términos | ES |
| **[legal/es/POLITICA-DE-PRIVACIDAD-PLANTILLA.md](legal/es/POLITICA-DE-PRIVACIDAD-PLANTILLA.md)** | Plantilla de Privacidad | ES |

### Documentación de la Landing Page

| Documento | Propósito |
|-----------|-----------|
| **[landing/HANDOFF.md](landing/HANDOFF.md)** | Contexto y estado de la landing de pre-lanzamiento |
| **[landing/README.md](landing/README.md)** | Instrucciones de instalación y configuración |

## 🗺️ Mapa del Proyecto

### Estructura de Carpetas

```
FasterFy-Plugin/
│
├── fasterfy.php              # Archivo principal del plugin
├── composer.json             # PSR-4 autoloading
├── readme.txt                # Descripción y changelog para WordPress.org
├── uninstall.php             # Limpieza al desinstalar
│
├── DOCUMENTACION.md          # Este índice maestro
├── CONTEXT.md                # Contexto completo del proyecto
│
├── docs/                     # Documentación del proyecto
│   ├── RESUMEN-EJECUTIVO.md  # Vista rápida del proyecto
│   ├── PROGRESS.md           # Historial de versiones
│   └── RESILIENCE.md         # Escenarios de fallo
│
├── includes/                 # Código PHP del plugin
│   ├── Core.php              # Contenedor de servicios
│   ├── Settings.php          # Gestión de opciones
│   ├── Logger.php            # Sistema de logging
│   │
│   ├── AI/                   # Sistema de IA
│   │   ├── AIManager.php
│   │   ├── OpenAIProvider.php
│   │   ├── Moderation.php
│   │   └── Contracts/
│   │
│   ├── Media/                # Gestión de medios
│   │   ├── MediaScanner.php
│   │   ├── BackupManager.php
│   │   └── UploadInterceptor.php
│   │
│   ├── Processors/           # Motor de procesamiento
│   │   ├── ImageEngine.php
│   │   ├── JpegProcessor.php
│   │   ├── PngProcessor.php
│   │   ├── SvgSanitizer.php
│   │   └── Contracts/
│   │
│   ├── Queue/                # Sistema de colas
│   │   └── QueueManager.php
│   │
│   ├── Rest/                 # API REST
│   │   └── RestController.php
│   │
│   └── Admin/                # Panel de administración
│       └── Admin.php
│
├── admin/                    # Assets del panel
│   ├── css/
│   │   └── fasterfy-admin.css
│   ├── js/
│   │   └── fasterfy-admin.js  # SPA vanilla
│   └── views/
│       └── app.php
│
├── legal/                    # Documentación legal
│   ├── README.md
│   ├── COMPLIANCE-CHECKLIST.md
│   ├── TERMS-OF-SERVICE-TEMPLATE.md
│   ├── PRIVACY-POLICY-TEMPLATE.md
│   ├── AI-DISCLOSURE.md
│   └── es/                   # Versiones en español
│
└── landing/                  # Landing page de pre-lanzamiento
    ├── HANDOFF.md
    ├── README.md
    ├── index.php
    ├── api/
    └── assets/
```

## 🔍 Búsqueda Rápida por Tema

### Arquitectura y Código
- **Autoloading**: `composer.json` + `fasterfy.php`
- **Inyección de dependencias**: `includes/Core.php`
- **API REST**: `includes/Rest/RestController.php`
- **SPA del panel**: `admin/js/fasterfy-admin.js`

### IA y Procesamiento
- **Integración IA**: `includes/AI/AIManager.php` y `OpenAIProvider.php`
- **Procesamiento de imágenes**: `includes/Processors/ImageEngine.php`
- **Sistema de colas**: `includes/Queue/QueueManager.php`

### Seguridad y Resiliencia
- **Concurrencia**: `docs/RESILIENCE.md` → Lock de concurrencia
- **Validación**: `includes/Media/BackupManager.php` → Validación de adjuntos
- **Cifrado**: `includes/Settings.php` → API keys cifradas

### Negocio y Legal
- **Modelo de negocio**: `CONTEXT.md` → Sección "Modelo de negocio"
- **Roadmap comercial**: `docs/RESUMEN-EJECUTIVO.md` → Sección "Modelo de Negocio"
- **Cumplimiento legal**: `legal/COMPLIANCE-CHECKLIST.md`
- **Plantillas legales**: `legal/TERMS-OF-SERVICE-TEMPLATE.md` y `PRIVACY-POLICY-TEMPLATE.md`

### Backlog y Próximos Pasos
- **Backlog completo**: `CONTEXT.md` → Sección "Backlog"
- **Backlog priorizado**: `docs/RESUMEN-EJECUTIVO.md` → Sección "Backlog Priorizado"
- **Próximos pasos**: `docs/PROGRESS.md` → Sección "Próximo paso sugerido"

## 📝 Convenciones de Documentación

### Estados
- ✅ **Completado** — Implementado y probado en producción
- 🟡 **Parcial** — Implementado pero con mejoras pendientes
- ⬜ **Pendiente** — No implementado, en backlog

### Prioridades
- 🔴 **Alta** — Crítico para lanzamiento (ej: i18n)
- 🟡 **Media** — Importante para producto (ej: informes descargables)
- 🟢 **Baja** — Endurecimiento técnico (ej: backoff ante 429)

### Historial
Todas las versiones se registran en:
1. **`readme.txt`** → Changelog técnico detallado
2. **`docs/PROGRESS.md`** → Tabla resumen de versiones
3. **Git commits** → Puntos de restauración

## 🔄 Flujo de Trabajo de Documentación

### Al implementar una función nueva
1. **Antes**: Leer `CONTEXT.md` para entender decisiones
2. **Durante**: Actualizar comentarios en el código
3. **Después**: Actualizar `readme.txt` (changelog) y subir versión

### Al completar un hito
1. Actualizar `docs/PROGRESS.md` con la nueva versión
2. Actualizar `CONTEXT.md` si hay cambios arquitectónicos
3. Commit descriptivo con formato: `tipo(scope): descripción`

### Al preparar un lanzamiento
1. Verificar `legal/COMPLIANCE-CHECKLIST.md`
2. Actualizar `docs/RESUMEN-EJECUTIVO.md` con estado actual
3. Revisar que `readme.txt` esté completo para WordPress.org

## 💡 Tips para Navegar el Proyecto

### Para desarrolladores nuevos
1. Lee **[docs/RESUMEN-EJECUTIVO.md](docs/RESUMEN-EJECUTIVO.md)** completo
2. Navega el código empezando por `fasterfy.php` → `includes/Core.php`
3. Inspecciona el SPA en `admin/js/fasterfy-admin.js`

### Para retomar después de semanas/meses
1. Haz `git log --oneline -20` para ver cambios recientes
2. Lee **[docs/RESUMEN-EJECUTIVO.md](docs/RESUMEN-EJECUTIVO.md)** → sección "Changelog Reciente"
3. Revisa backlog priorizado para confirmar próximos pasos

### Para entender una decisión técnica
1. Busca en **[CONTEXT.md](CONTEXT.md)** → sección "Decisiones clave"
2. Si es sobre resiliencia, ve a **[docs/RESILIENCE.md](docs/RESILIENCE.md)**
3. Revisa el changelog en **[readme.txt](readme.txt)** por la versión donde se implementó

## 🎓 Recursos Externos

### WordPress
- [Plugin Handbook](https://developer.wordpress.org/plugins/)
- [REST API Handbook](https://developer.wordpress.org/rest-api/)
- [Coding Standards](https://developer.wordpress.org/coding-standards/)

### Internacionalización
- [I18n for WordPress Developers](https://developer.wordpress.org/plugins/internationalization/)
- [wp.i18n JavaScript package](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/)

### IA Multimodal
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [Google Gemini Vision](https://ai.google.dev/gemini-api/docs/vision)

### Licencias y Cobros
- [Freemius](https://freemius.com/)
- [Lemon Squeezy](https://www.lemonsqueezy.com/)
- [Paddle](https://www.paddle.com/)

## 📞 Mantenimiento de Este Índice

Este índice debe actualizarse cuando:
- ✅ Se añade un nuevo documento importante
- ✅ Se reorganiza la estructura de carpetas
- ✅ Se completa un hito mayor del proyecto
- ✅ Se actualiza la versión (anotar en encabezado)

---

**Mantenedor**: EslenderE3  
**Versión del proyecto**: 1.0.17  
**Última actualización de este índice**: 1 de julio de 2026
