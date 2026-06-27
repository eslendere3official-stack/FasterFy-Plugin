# FasterFy — SaaS compliance checklist (adapted) + current status

> Not legal advice. Status reflects the plugin codebase only. Items about your
> company, website and taxes are for you to complete with a lawyer/accountant.
> Legend: ✅ done in plugin · 🟡 partial · ⬜ pending (your task) · ➖ N/A to plugin (belongs to your website/SaaS)

## Foundation 1 — Legal structure (your task)
- ⬜ Legal entity that bills customers (sole proprietor vs local company vs US LLC).
- ⬜ Tax residency / where you declare income.
- ⬜ Separate business bank account.
- ⬜ If US LLC: calendar reminder for Form 5472 + 1120 pro forma (penalty up to $25k).

## Foundation 2 — Terms of Service
- ➖ Lives on your sales/SaaS website, not in the plugin.
- 🟡 Template provided: `legal/TERMS-OF-SERVICE-TEMPLATE.md` (personalize + lawyer review).
- ⬜ Link it in your site footer and at checkout/signup.

## Foundation 3 — Privacy
- 🟡 Template provided: `legal/PRIVACY-POLICY-TEMPLATE.md`.
- ✅ Plugin minimizes data: it processes the site's own media; it does not collect
  end-user personal data or phone home in the self-hosted version.
- ✅ AI subprocessor is transparent and configurable; documented in `AI-DISCLOSURE.md`.
- ⬜ List subprocessors (AI provider, your host, payment processor) + sign their DPAs.
- ⬜ Cookie banner on your website if you use analytics.

## Foundation 4 — Security (plugin status)
- ✅ Direct file access blocked (`ABSPATH` guard in every PHP file).
- ✅ Authorization: all REST endpoints require `manage_options` (admins only).
- ✅ CSRF: WordPress REST nonce (`X-WP-Nonce`) on every panel request.
- ✅ SQL injection: `$wpdb->prepare`, `esc_like` for search, whitelisted ORDER BY.
- ✅ Output escaping in the admin SPA and PHP views.
- ✅ Secrets: AI API key encrypted at rest (AES-256), never exposed to the browser.
- ✅ SVG sanitization (removes scripts, on* handlers, javascript:, blocks XXE/DOCTYPE).
- ✅ Non-destructive: backup before optimizing + one-click rollback.
- ✅ Hardened `unserialize` (`allowed_classes => false`) against PHP object injection.
- 🟡 Audit logging: processing log exists (`Logger`); not a full security audit trail.
- ⬜ HTTPS everywhere → enforce on the site/server (not controllable by the plugin).
- ⬜ Run WPCS (WordPress Coding/Security Standards) + WPScan before launch.
- ⬜ Tested, automated site backups (separate from FasterFy's asset backups).
- ➖ Password hashing, 2FA, login brute-force protection → handled by WordPress core / security plugins.
- ➖ Multi-tenant isolation → N/A for self-hosted; relevant for the future Cloud.
- ⬜ Incident response plan (contain → assess → notify ≤72h GDPR → document → fix).

## Foundation 5 — Payments & marketing (your website)
- ➖ Use Stripe / Paddle / Lemon Squeezy; never store card numbers (avoids PCI scope).
- ⬜ Enable Stripe Tax or use a Merchant of Record (Paddle/Lemon Squeezy) for global tax.
- ⬜ Visible refund policy.
- ⬜ Email/marketing: opt-in + working unsubscribe + sender identity (CAN-SPAM/GDPR).

## Bonus — AI
- ✅ AI usage is disclosed in-product (IA & SEO panel) and in `AI-DISCLOSURE.md`.
- ✅ Output framed as assistive (reviewable), not guaranteed.
- ⬜ Add the AI disclosure line to your landing page and Privacy Policy.
- ⬜ List the AI subprocessor + sign its DPA.

## Tools (reference)
Terms/Privacy: Termly, iubenda, GetTerms · Cookies: Cookiebot, Osano · Payments: Stripe,
Paddle, Lemon Squeezy · US LLC: Firstbase, doola, Stripe Atlas · USD bank: Mercury, Wise.
