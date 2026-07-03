# FasterFy — Pro Media Optimizer for WordPress

> **Smart, automated, and non-destructive media optimization powered by multimodal AI**

[![Version](https://img.shields.io/badge/version-1.0.17-brightgreen.svg)](https://github.com/EslenderE3/FasterFy-Plugin)
[![PHP](https://img.shields.io/badge/PHP-8.0+-blue.svg)](https://www.php.net/)
[![WordPress](https://img.shields.io/badge/WordPress-6.0+-blue.svg)](https://wordpress.org/)
[![License](https://img.shields.io/badge/license-GPLv2+-red.svg)](https://www.gnu.org/licenses/gpl-2.0.html)

---

## 🚀 What is FasterFy?

FasterFy is a **native WordPress plugin** that combines advanced image processing with AI-powered content generation to:

- 🖼️ **Convert & Compress**: JPG → WebP/AVIF, PNG compression with alpha channel, SVG sanitization
- 🤖 **AI-Generated Metadata**: Alt text, SEO-friendly titles, descriptions, and semantic renaming
- ♻️ **Non-Destructive**: Automatic backups with one-click rollback
- ⚡ **Batch Processing**: Browser-driven queues (works on any hosting, no WP-Cron dependency)
- 🎨 **Modern UI**: SPA admin panel with Lite/Pro modes, performance dashboard, and visual analytics

Built for **WordPress site owners**, **agencies**, and **performance enthusiasts** who want to optimize media libraries at scale without sacrificing quality or control.

---

## ✨ Key Features

### 🎨 Image Processing
- **WebP/AVIF Conversion**: Automatic transcoding with intelligent compression
- **PNG Compression**: Real compression with `PNG_ALL_FILTERS` (preserves alpha channel)
- **SVG Sanitization**: Removes scripts, handlers, and design metadata (security-first)
- **Thumbnail Regeneration**: Automatic regeneration of all WordPress image sizes

### 🤖 AI-Powered Content
- **Alt Text Generation**: SEO-optimized, descriptive alternative text
- **Semantic Renaming**: Meaningful filenames based on image content
- **Custom Titles & Captions**: SEO-friendly with/without hyphens
- **NSFW Moderation**: Optional content safety checks (protects API accounts)
- **Provider Agnostic**: Compatible with OpenAI, Google Gemini, Anthropic, and OpenAI-compatible endpoints

### ⚙️ Smart Queue System
- **Browser-Driven Batches**: Reliable processing without WP-Cron
- **Concurrency Lock**: Prevents conflicts from multiple tabs/processes
- **Time Budget**: ~20s per tick to avoid PHP timeouts
- **Automatic Retries**: Up to 3 attempts for AI requests
- **Throttling & Quota Control**: Configurable batch size and monthly limits

### 🔒 Security & Reliability
- **Encrypted API Keys**: AES-256-CBC using WordPress security keys
- **Non-Destructive Architecture**: Original files backed up before processing
- **One-Click Rollback**: Restore original images instantly
- **Unserialize Safety**: Secure handling of serialized WordPress data
- **Attachment Validation**: Prevents processing invalid/deleted attachments

### 📊 Professional Admin Panel
- **Performance Dashboard**: Real-time KPIs, animated donut charts, before/after comparisons
- **Multiple Views**: List, grid, and detailed image views
- **Bulk Actions**: Optimize, AI process, or revert multiple images at once
- **Lite/Pro Modes**: Simplified interface for basic users, advanced options for pros
- **Search & Filters**: Find images by name, status, format, or date
- **Visual Identity**: Modern design with #1F1F1F / #33EE33 color scheme

---

## 📦 Installation

### Requirements
- **PHP**: 8.0 or higher
- **WordPress**: 6.0 or higher
- **Image Processing**: Imagick (recommended) or GD with WebP/AVIF support
- **AI Features** (optional): API key from OpenAI-compatible provider

### Quick Start

1. **Download or clone** this repository into `wp-content/plugins/FasterFy-Plugin/`

```bash
cd wp-content/plugins/
git clone https://github.com/EslenderE3/FasterFy-Plugin.git fasterfy
```

2. **Activate** the plugin from WordPress admin → Plugins

3. **Configure** AI provider (optional):
   - Navigate to **FasterFy** menu in WordPress admin
   - Go to **Settings** tab
   - Enter your API endpoint and key
   - Choose model and language

4. **Start optimizing**:
   - Go to **Gallery** tab
   - Select images or use **Scan Library** to find unoptimized images
   - Click **Optimize** or **Process AI** to start batch processing

---

## 🎯 Use Cases

### For Site Owners
- ✅ Improve **Core Web Vitals** scores (Largest Contentful Paint)
- ✅ Reduce **hosting costs** with smaller file sizes
- ✅ Boost **SEO rankings** with descriptive alt text
- ✅ Speed up **page load times** with modern formats

### For Agencies
- ✅ Optimize **client sites** at scale
- ✅ Automate **accessibility compliance** (WCAG alt text requirements)
- ✅ Generate **consistent metadata** across thousands of images
- ✅ Offer **premium optimization** as a service

### For Content Creators
- ✅ Focus on **content creation** instead of manual optimization
- ✅ Automatically **improve SEO** for every uploaded image
- ✅ Maintain **high quality** with non-destructive processing
- ✅ Roll back **any changes** with one click

---

## 📚 Documentation

### Quick Links
- **[Getting Started](docs/RESUMEN-EJECUTIVO.md)** — 10-minute overview of the project
- **[Full Documentation Index](DOCUMENTACION.md)** — Complete navigation guide
- **[Architecture & Context](CONTEXT.md)** — Technical decisions, business model, backlog
- **[Version History](docs/PROGRESS.md)** — Changelog and functional status
- **[Resilience Guide](docs/RESILIENCE.md)** — Failure scenarios and prevention strategies

### For Developers
- **[File Structure](DOCUMENTACION.md#-mapa-del-proyecto)** — Understand the codebase organization
- **[API Documentation](CONTEXT.md#mapa-de-archivos)** — REST endpoints and integration points
- **[Contributing](CONTEXT.md#comprobaciones-antes-de-subir-cambios)** — Pre-commit checklist

---

## 🛣️ Roadmap

### ✅ Completed (v1.0.17)
- WebP/AVIF conversion with real PNG compression
- AI multimodal integration (OpenAI-compatible)
- Browser-driven batch queues with retry logic
- Non-destructive backup and rollback system
- Performance dashboard with KPIs and charts
- Bulk actions for multiple images
- Lite/Pro mode differentiation
- Legal compliance kit (Terms, Privacy, AI Disclosure) in EN + ES
- Concurrency lock and time budget safeguards

### 🔴 High Priority (Pre-Launch)
- [ ] **Internationalization**: English as base language + Spanish translation + `.pot` generation
- [ ] **License Management**: Choose and integrate payment platform (Freemius, Lemon Squeezy, or Paddle)
- [ ] **License System**: Activation, deactivation, and automatic updates
- [ ] **WordPress.org Submission**: Prepare Lite version for public directory
- [ ] **Legal Review**: Finalize Terms, Privacy Policy, and DPAs with attorney

### 🟡 Medium Priority (Product)
- [ ] Downloadable reports (CSV/PDF) for savings and optimization stats
- [ ] Reset AI retry counter from UI
- [ ] "Select all (page)" in gallery
- [ ] Global "Revert All" with confirmation
- [ ] Real PageSpeed/Core Web Vitals integration

### 🟢 Low Priority (Technical Hardening)
- [ ] Exponential backoff for AI provider 429 responses
- [ ] Cache scanner counts for large libraries (transients)
- [ ] Memory/dimension guards for huge images
- [ ] Disk space check + auto-purge old backups
- [ ] Automatic nonce refresh for long batches
- [ ] Conflict detection with other optimization plugins
- [ ] WordPress Multisite support and validation

See **[docs/RESUMEN-EJECUTIVO.md](docs/RESUMEN-EJECUTIVO.md)** for detailed roadmap and priorities.

---

## 💼 Business Model

FasterFy is being developed as a **SaaS subscription product** for the global market:

- 🎯 **Target Markets**: United States (primary) and Latin America (secondary)
- 💰 **Revenue Model**: Free Lite version on WordPress.org + paid Pro version with advanced features
- 🌍 **Multilingual**: English (base) + Spanish (secondary) with full i18n support
- 🔐 **Licensing**: Platform TBD (Freemius recommended for WordPress ecosystem)

See **[CONTEXT.md](CONTEXT.md#modelo-de-negocio-y-hoja-de-ruta-comercial-importante)** for complete commercial strategy.

---

## 🧑‍💻 Technical Architecture

### Stack
- **Backend**: PHP 8+, PSR-4 autoloading
- **Frontend**: Vanilla JavaScript SPA (no build tools required)
- **Image Processing**: Imagick (preferred) / GD (fallback)
- **AI Integration**: OpenAI-compatible provider abstraction
- **Database**: Custom tables + WordPress postmeta

### Key Components
```
includes/
├── Core.php              # Service container and bootstrap
├── Settings.php          # Options management (encrypts API keys)
├── Logger.php            # Custom logging system
├── AI/                   # AI manager, providers, moderation
├── Media/                # Scanner, backups, upload interceptor
├── Processors/           # Image engine (JPEG/PNG/SVG processors)
├── Queue/                # Batch queue manager
├── Rest/                 # REST API controller
└── Admin/                # Admin panel integration
```

### Design Principles
1. **AI reads JPEG, not AVIF**: Vision models don't support AVIF → temporary JPEG copy sent
2. **Browser-driven batches**: Reliable on any hosting, no WP-Cron dependency
3. **Non-destructive by default**: Original always backed up before processing
4. **Concurrency control**: Lock with auto-expiration prevents conflicts
5. **Time budget**: ~20s per tick to avoid PHP timeout errors

See **[CONTEXT.md](CONTEXT.md#decisiones-clave)** for complete design decisions.

---

## 🛡️ Resilience & Scalability

### Mitigated Risks ✅
- PHP timeouts → Time budget per batch tick
- Memory exhaustion → Per-image memory release + batch size limits
- Concurrency conflicts → Lock with auto-expiration
- AI rate limits → Retry logic + throttling + quota control
- Corrupt images → Per-image error handling (doesn't break batch)

### Pending Improvements ⬜
- Exponential backoff for 429 responses
- Cache scanner counts for large databases
- Preemptive memory/dimension validation
- Automatic disk space checks + backup purging

See **[docs/RESILIENCE.md](docs/RESILIENCE.md)** for complete failure scenarios and prevention strategies.

---

## 📄 Legal & Compliance

FasterFy includes a **complete legal compliance kit** for SaaS businesses:

### Included Templates (EN + ES)
- ✅ **Terms of Service** — Defines usage rights, disclaimers, and limitations
- ✅ **Privacy Policy** — GDPR/CCPA compliant data handling disclosure
- ✅ **AI Disclosure** — Transparent explanation of AI usage (shown in plugin admin)
- ✅ **Compliance Checklist** — 5 foundations for SaaS legal compliance with status tracking

**⚠️ Important**: Templates are informational guides, not legal advice. Consult an attorney before publication.

See **[legal/README.md](legal/README.md)** for complete legal documentation.

---

## 🤝 Contributing

Contributions are welcome! Before submitting changes:

1. **Read documentation**: Start with [DOCUMENTACION.md](DOCUMENTACION.md)
2. **Check coding standards**: PHP-CS-Fixer with PSR-12 + WordPress standards
3. **Test locally**: Verify `php -l` and `node --check` on modified files
4. **Update changelog**: Add entry to `readme.txt`
5. **Bump version**: Update version in `fasterfy.php` (header + constant)

See **[CONTEXT.md](CONTEXT.md#comprobaciones-antes-de-subir-cambios)** for pre-commit checklist.

---

## 📜 License

**GPLv2 or later**  
See [LICENSE](https://www.gnu.org/licenses/gpl-2.0.html) for details.

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/EslenderE3/FasterFy-Plugin/issues)
- **Documentation**: [DOCUMENTACION.md](DOCUMENTACION.md)
- **Project Context**: [CONTEXT.md](CONTEXT.md)

---

## 🎓 Key Learnings from This Project

1. **AI multimodal has format limitations**: Not all models support all formats (e.g., AVIF unsupported)
2. **WordPress hosting is heterogeneous**: Design for the lowest common denominator (short timeouts, limited memory)
3. **Legal is critical in SaaS**: Prepare from day one, not as an afterthought
4. **Internationalization is not optional**: Target market requires English as base language
5. **Browser-driven batches > WP-Cron**: More reliable, works on all hostings
6. **Non-destructive builds trust**: Users value the ability to rollback changes

---

## 🙏 Acknowledgments

Built with passion for the WordPress community and powered by modern AI technology.

Special thanks to:
- WordPress core team for the excellent REST API and media handling
- OpenAI, Google, and Anthropic for advancing multimodal AI accessibility
- The open-source community for tools like Imagick, GD, and Action Scheduler

---

**Made with ❤️ by [EslenderE3](https://github.com/EslenderE3)**

**Version**: 1.0.17 | **Last Updated**: July 1, 2026
