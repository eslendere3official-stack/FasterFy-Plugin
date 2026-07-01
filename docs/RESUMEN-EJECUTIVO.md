# FasterFy — Resumen Ejecutivo del Proyecto

> Documento de vista rápida para entender el estado actual, arquitectura y próximos pasos del proyecto.
> Última actualización: v1.0.17 (30 de junio de 2026).

## 🎯 Visión del Producto

**FasterFy** es un plugin de WordPress para optimización automática de medios con IA multimodal.

- **Conversión de formatos**: JPG → WebP/AVIF, compresión PNG, sanitización SVG
- **IA generativa**: Alt text, títulos SEO, descripciones y renombrado semántico
- **Arquitectura no destructiva**: Respaldo automático + rollback con 1 clic
- **Procesamiento por lotes**: Interfaz SPA moderna, sin dependencia de WP-Cron

## 📊 Estado del Proyecto

### Versión Actual: **1.0.17**

**Completado (100% funcional):**
- ✅ Motor de conversión WebP/AVIF con compresión PNG real (PNG_ALL_FILTERS)
- ✅ Integración IA multimodal (compatible OpenAI/Gemini/Anthropic)
- ✅ Sistema de colas con reintentos, throttling y control de cuota
- ✅ Panel SPA con identidad visual FasterFy (#1F1F1F / #33EE33)
- ✅ Dashboard de rendimiento: KPIs, gráficos animados, comparativas
- ✅ Selección múltiple y acciones masivas unificadas
- ✅ Vistas: lista, cuadrícula y detalle por imagen
- ✅ Modos Lite/Pro diferenciados
- ✅ Sistema de rollback no destructivo
- ✅ Lock de concurrencia + presupuesto de tiempo
- ✅ Kit legal SaaS (Términos, Privacidad, divulgación IA) en EN + ES

**En producción del cliente:**
- Plugin probado en sitios reales con bibliotecas de cientos de imágenes
- IA configurada con Google Gemini (capa gratuita) via endpoint OpenAI-compatible

## 🏗️ Arquitectura Técnica

### Stack
- **Backend**: PHP 8+, PSR-4 autoloading propio
- **Frontend**: SPA vanilla JavaScript (sin frameworks de build)
- **Imagen**: Imagick (preferido) / GD (fallback)
- **IA**: Proveedor abstracción (implementado: OpenAI-compatible)
- **BD**: Tablas propias + postmeta de WordPress

### Componentes Clave
```
includes/
├── Core.php              # Contenedor de servicios y arranque
├── Settings.php          # Opciones (cifra API key)
├── Logger.php            # Logging en tabla propia
├── Processors/           # Motor de imagen (JPEG/PNG/SVG)
├── Media/                # Escáner, respaldos, interceptor
├── Queue/                # Sistema de colas (conducido por navegador)
├── AI/                   # Manager, providers, moderación
├── Rest/                 # API REST fasterfy/v1
└── Admin/                # Panel de administración
```

### Decisiones de Diseño

1. **IA lee JPEG, no AVIF**: Los modelos de visión no soportan AVIF → se envía copia JPEG temporal
2. **Lotes vía navegador**: Fiable en cualquier hosting, no requiere WP-Cron
3. **No destructivo**: Original siempre respaldado antes de procesar
4. **Concurrencia controlada**: Lock con auto-expiración previene conflictos
5. **Presupuesto de tiempo**: ~20s por tick para evitar timeouts de PHP

## 💼 Modelo de Negocio

### Objetivo: SaaS por Suscripción

**Mercados objetivo:**
- 🎯 **Estados Unidos** (principal)
- 🌎 América Latina (secundario)

**Modelo de ingresos:**
- **Lite**: Gratis en WordPress.org (funciones básicas)
- **Pro**: Suscripción de pago (funciones avanzadas, IA ilimitada, soporte prioritario)

### Stack Comercial (a implementar)

**Plataforma de cobros** (opciones evaluadas):
1. **Freemius** (recomendado) — llave en mano para plugins WP
2. **Lemon Squeezy / Paddle** — Merchant of Record (gestiona impuestos globales)
3. **EDD + Software Licensing** — autoalojado, más control

**Gestión de licencias:**
- Sistema de activación/desactivación
- Entrega automática de actualizaciones
- Dashboard del dueño (analítica, ventas, licencias)

## 🚨 Prioridad #1: Internacionalización

**Estado actual**: Todas las cadenas están en español.

**Necesario para lanzamiento:**
1. ✅ Plantillas legales ya en inglés (EN) + español (ES)
2. ⚠️ **Migrar código a inglés como idioma base**
3. ⚠️ Generar `languages/fasterfy.pot`
4. ⚠️ Crear traducción `es_ES.po/.mo`
5. ⚠️ Implementar `wp.i18n` en el JavaScript del SPA

**Por qué es crítico:**
- Mercado principal es EE.UU. (habla inglesa)
- WordPress.org requiere inglés para aprobación
- Base multilenguaje permite expansión futura

## 📋 Backlog Priorizado

### 🔴 Alta Prioridad (pre-lanzamiento)
1. **Internacionalización completa** (EN base + ES)
2. **Elegir e integrar plataforma de cobros**
3. **Sistema de licencias en el plugin**
4. **Publicar documentación legal final** (revisar con abogado)
5. **Preparar Lite para WordPress.org**

### 🟡 Media Prioridad (producto)
- Informe de ahorro descargable (CSV/PDF)
- Reset de reintentos de IA desde UI
- "Seleccionar todo (página)" en galería
- "Revertir todo" global con confirmación
- Integración real PageSpeed/Core Web Vitals

### 🟢 Baja Prioridad (endurecimiento técnico)
- Backoff exponencial ante 429 de IA
- Cachear conteos del escáner (bibliotecas grandes)
- Guardas de memoria para imágenes enormes
- Auto-purga de respaldos + chequeo de disco
- Refresco automático del nonce en lotes largos
- Detección de plugins en conflicto
- Soporte/validación de Multisite

## 🛡️ Resiliencia y Escalabilidad

**Mitigaciones implementadas:**
- ✅ Lock de concurrencia con auto-expiración
- ✅ Presupuesto de tiempo por tick (~20s)
- ✅ Reintentos automáticos (hasta 3) para IA
- ✅ Throttling configurable + control de cuota mensual
- ✅ Liberación de memoria por imagen
- ✅ Captura de errores por ítem (no rompe el lote)

**Escenarios cubiertos:**
- Timeouts de PHP (max_execution_time)
- Concurrencia (dos pestañas/procesos a la vez)
- Rate limits de proveedores de IA (429)
- Imágenes corruptas o formatos raros
- Cierre de pestaña a mitad de lote

**Pendientes de implementar:**
- Backoff inteligente ante 429
- Cacheo de conteos (BD pesadas)
- Validación previa de memoria/dimensiones
- Gestión automática de espacio en disco

Ver detalles completos en `docs/RESILIENCE.md`.

## 📚 Documentación del Proyecto

### Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `CONTEXT.md` | Arquitectura, decisiones, negocio, backlog completo |
| `docs/PROGRESS.md` | Historial de versiones y estado funcional |
| `docs/RESILIENCE.md` | Escenarios de fallo y plan de prevención |
| `docs/RESUMEN-EJECUTIVO.md` | Este documento (vista rápida) |
| `readme.txt` | Changelog detallado y descripción para WordPress.org |
| `legal/` | Plantillas legales (Términos, Privacidad, IA) EN + ES |
| `landing/HANDOFF.md` | Contexto de la landing page (sesión paralela) |

### Changelog Reciente (v1.0.10 → v1.0.17)

**v1.0.10** — Compresión PNG real (PNG_ALL_FILTERS)  
**v1.0.11** — IA lee JPEG en lugar de AVIF  
**v1.0.12** — Acciones masivas unificadas (selección múltiple)  
**v1.0.13** — Identidad visual FasterFy (#1F1F1F / #33EE33)  
**v1.0.14** — Panel a pantalla completa (100vh, sin doble scroll)  
**v1.0.15** — Corrección de hovers y bordes  
**v1.0.16** — Vista de detalle por imagen, orden por tipo  
**v1.0.17** — Dashboard de rendimiento rediseñado (KPIs, donut, comparativas)

## 🔄 Cómo Retomar el Proyecto

El proyecto es **portable** y no depende de la memoria del chat.

**Para continuar en una nueva sesión:**
1. Conectar/clonar repo `EslenderE3/FasterFy-Plugin`
2. Leer en orden:
   - `docs/RESUMEN-EJECUTIVO.md` (este archivo)
   - `CONTEXT.md` (arquitectura detallada)
   - `docs/PROGRESS.md` (estado funcional)
3. Continuar desarrollo según prioridades del backlog

**Trabajo en paralelo:**
- Sesión del **plugin**: raíz + `includes/` + `admin/` + `docs/` + `legal/`
- Sesión de la **landing**: solo carpeta `landing/`
- Coordinación: hacer `pull` antes de cambios grandes

## 🎓 Aprendizajes Clave del Proyecto

1. **IA multimodal tiene limitaciones**: No todos los modelos soportan todos los formatos (ej: AVIF)
2. **WordPress hosting es heterogéneo**: Diseñar para el denominador común (timeouts cortos, memoria limitada)
3. **Legal es crítico en SaaS**: Preparar desde el inicio, no al final
4. **Internacionalización no es opcional**: Mercado principal requiere inglés
5. **Lotes vía navegador > WP-Cron**: Más fiable, funciona en todos los hostings
6. **No destructivo da confianza**: Los usuarios valoran poder revertir

## 📞 Próximos Pasos Inmediatos

1. **Confirmar prioridad con el dueño**: ¿i18n primero, o alguna función de producto?
2. **Si i18n**: Crear plan de migración (PHP strings → `__()`, JS → `wp.i18n`, generar .pot)
3. **Si producto**: Elegir función del backlog y especificar
4. **Preparar para lanzamiento**: Elegir plataforma de cobros, integrar licencias

---

**Estado del repositorio**: Limpio, sincronizado con `origin/main`, sin cambios pendientes.  
**Última revisión**: 1 de julio de 2026.
