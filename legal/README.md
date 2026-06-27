# FasterFy — Legal & Compliance starter kit

> ⚠️ **Not legal advice.** These are starter templates based on a practical SaaS
> compliance checklist, personalized for FasterFy. Review and adapt them with a
> qualified lawyer and accountant for your jurisdiction, data types and markets
> (target: USA + LATAM). Last review of the source material: Jun 2026.

## Who needs what (important distinction)

FasterFy currently ships as a **self-hosted WordPress plugin** the customer
installs on their own site. That changes responsibilities:

| Scenario | Data controller | Your responsibility (as vendor) |
|---|---|---|
| **Plugin installed on customer's WP** (today) | The customer | AI disclosure, document what data leaves the site (images → AI provider), list the AI subprocessor, don't train on their data |
| **Your sales/marketing website** (when you sell Pro) | You | Terms of Service, Privacy Policy, cookie banner, payment processor, refunds |
| **Hosted SaaS / FasterFy Cloud** (future: API key on your servers) | You | Full controller obligations: DPAs, breach notification, security, tax |

## Files
- `TERMS-OF-SERVICE-TEMPLATE.md` — for your sales/SaaS website.
- `PRIVACY-POLICY-TEMPLATE.md` — for your sales/SaaS website.
- `AI-DISCLOSURE.md` — AI transparency text (also surfaced inside the plugin).
- `COMPLIANCE-CHECKLIST.md` — the 5 foundations adapted to FasterFy with current status.

Placeholders look like `[LIKE_THIS]` — replace them before publishing.
