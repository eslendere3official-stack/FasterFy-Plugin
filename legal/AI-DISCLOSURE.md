# AI Disclosure — FasterFy

> Not legal advice. Transparency statement about FasterFy's use of artificial
> intelligence. Surface a short version inside the product and in your Privacy Policy.

## Short version (use in the admin UI and landing page)
FasterFy uses third-party AI to analyze images and generate SEO text (alt text,
titles, descriptions). AI output may contain errors or inaccuracies and should be
reviewed. FasterFy does not use your images to train AI models.

## What the plugin sends to the AI provider
- When you run the AI features, FasterFy sends the **image** (or a resized copy)
  and a text prompt to the **AI provider you configure** (the "Endpoint base" and
  model in *IA & SEO*). By default this is an OpenAI-compatible endpoint; you may
  point it to Google Gemini, OpenAI, OpenRouter, etc.
- The provider returns descriptive text that FasterFy stores in WordPress
  (alt text, title, caption, description).

## What we do NOT do
- We do **not** sell your data.
- We do **not** use your images or content to train our own models.
- The plugin does **not** transmit data to FasterFy's servers in the self-hosted
  version; the only external call is to the AI provider you configured.

## Your responsibilities as the site owner
- List your AI provider as a **subprocessor** in your Privacy Policy and sign/accept
  their **DPA** (e.g., OpenAI, Google).
- Avoid sending personal or sensitive images to the AI provider without a legal basis.
- Do not present AI output as guaranteed accurate (no "100% accurate" claims). The
  US FTC treats overstated/hidden AI claims as deceptive advertising.

## Subprocessor (fill in the one you use)
- Provider: `[e.g., Google Gemini API / OpenAI]`
- Purpose: image understanding + text generation
- DPA: `[link to provider DPA]`
- Data location: `[provider regions]`
