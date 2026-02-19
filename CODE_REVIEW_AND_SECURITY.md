# Code review and security / doxxing check

Review of the mdly codebase for code quality, security, and exposure of personal or sensitive information (doxxing risks).

---

## 1. Doxxing / sensitive data assessment

### 1.1 What was checked

- Email addresses (personal and role-based)
- Physical addresses (street, city, postcode)
- Phone numbers
- Real names in comments or config
- API keys, secrets, tokens, credentials
- Internal URLs or IPs that could identify individuals or infrastructure

### 1.2 Findings

**Company / product contact (legal and config)**

- **Location:** `apps/landing/content/legal/privacy.md`, `apps/landing/content/legal/terms.md`, `apps/landing/src/lib/site-config.ts`
- **Content:**  
  - Registered/contact address: **1 Greenaway Gardens, London, NW3 7DJ**  
  - Emails: **support@usemonoid.com**, **info@usemonoid.com**, **dpo@usemonoid.com**, **privacy@usemonoid.com**  
  - Product name **MONOid**, domain **usemonoid.com**, and social links (X, LinkedIn, TikTok, Instagram)
- **Assessment:**  
  - These are **company/legal contact details**, not private individual data. They are appropriate for public Terms and Privacy pages and for a production site.  
  - **Doxxing risk:** If **1 Greenaway Gardens, London, NW3 7DJ** is a **private residence** (e.g. founder’s home) and this repo is **public as “mdly”**, that address is effectively doxxing—it links a person to a physical location. If it is a **registered office** or virtual office, the risk is lower but you may still want to redact or use a generic placeholder (e.g. “London, UK”) in the open-source repo and keep the real address only in a private/deployed copy.
- **Recommendation:**  
  - If the repo is public and the address is a home address: **replace it in the repo** with a placeholder (e.g. “\[Registered address available on request\]” or “London, UK”) and keep the real address only in private config or in the deployed MONOid site.  
  - If the address is a proper business address and you are fine with it being public: no change required from a doxxing perspective.

**Mock / example data**

- **Location:** `apps/landing/src/components/scout-detail-mockup.tsx`  
- **Content:** `sarah@example.com`, `mike@example.com`, `you@example.com` in avatar `alt` attributes  
- **Assessment:** Placeholder/example only; **no doxxing risk**.

**Secrets and credentials**

- **Location:** `apps/landing/.env.example`  
- **Content:** `AUTUMN_SECRET_KEY=your_autumn_secret_key_here` and commented `NEXT_PUBLIC_*` download URLs  
- **Assessment:** Placeholder values only; **no real secrets**. No hardcoded API keys or passwords found in the codebase.

**Summary (doxxing)**

- No personal emails, phone numbers, or real names that would dox an individual.
- Only potential issue: **physical address in legal content** if it is a private residence and the repo is public—then replace with a placeholder in the repo.

---

## 2. Security review

### 2.1 Markdown rendering (XSS)

- **Component:** `apps/landing/src/components/markdown-renderer.tsx`
- **Behavior:** Renders a string with `react-markdown`; no custom `rehype-raw` or raw HTML.
- **Data source:** Legal pages read markdown from **static files** on the server (`content/legal/*.md`) via `fs.readFile`; content is not user-supplied.
- **Assessment:**  
  - **Current use:** Safe—trusted source, and default react-markdown does not render arbitrary HTML.  
  - **If you later add** `rehype-raw` (or similar) to support HTML in markdown, you **must** add sanitization (e.g. `rehype-sanitize`) and/or a strict schema to avoid XSS if any markdown ever comes from users or external sources.

### 2.2 Link handling

- **Editor:** `packages/ui/src/editor/plugins/clickable-link-plugin.tsx`  
  - Rejects `javascript:` hrefs (line 31).  
  - Uses `window.open(..., "noopener,noreferrer")` for external links.  
- **Landing:** `MarkdownRenderer` sets `target="_blank"` and `rel="noreferrer"` on external links via `useEffect`.  
- **Assessment:** Good; no `javascript:` or unsafe `target`/`rel` usage.

### 2.3 Environment and configuration

- **Secrets:** No hardcoded API keys, tokens, or passwords.  
- **Env usage:**  
  - `NEXT_PUBLIC_*` used for download URLs and (in web app) base URL with fallback to `https://placeholder.com`.  
  - `.env.example` contains only placeholders.  
- **Assessment:** Sensitive configuration is correctly externalized.

### 2.4 Dangerous patterns

- **Searched for:** `dangerouslySetInnerHTML`, `eval(`, `new Function(`, `javascript:`, `innerHTML`, `document.write`, `.html(`  
- **Result:** None except the intentional `javascript:` **check** in the link plugin (which blocks such links).  
- **Assessment:** No unsafe HTML injection or dynamic code execution patterns found.

---

## 3. Code quality and architecture (high level)

### 3.1 Landing app

- **Legal pages:** Server components; markdown loaded from disk and passed to `MarkdownRenderer`. Clear separation and no client-side loading of legal content.
- **Homepage:** MDX from Fumadocs; single compiled document and shared `mdx-components.tsx` for design-system mapping. Structure is clear.
- **Site config:** `site-config.ts` centralizes branding and URLs; MONOid-specific. If mdly is distributed as a template, consider making branding/config overridable (e.g. env or a single config file) so adopters don’t ship MONOid details by default.
- **Privacy/terms path handling:** Multiple `possiblePaths` for `content/legal/*.md` suggest different run contexts (monorepo root vs. app dir). Works but is a bit brittle; a single canonical path (e.g. from a config or `process.cwd()` relative to the app) would simplify.

### 3.2 Packages (editor / UI)

- **Link plugin:** Clear responsibility (clickable links, block `javascript:`), with selection-aware behavior.
- **Editor:** Lexical-based; no obvious security anti-patterns in the reviewed files.

### 3.3 Recommendations (non-security)

- Add **remark-gfm** and custom **components** to `MarkdownRenderer` as planned (README) so GFM and prose styling are complete.
- If markdown will ever be user-generated or from an API, introduce **sanitization** (e.g. rehype-sanitize) before enabling raw HTML.
- Consider **type safety** for the Fumadocs doc collection on the homepage (replace `docs as any` and array detection with a typed helper or type guard).

---

## 4. Summary table

| Area              | Status   | Notes |
|-------------------|----------|--------|
| Personal doxxing  | Clear    | No personal emails/names/phones. Only company address in legal docs—replace if it’s a private residence and repo is public. |
| Company contact   | Intentional | Legal and site-config use MONOid/usemonoid.com; fine for production, consider placeholders if mdly is a public template. |
| Secrets in repo   | Clear    | No hardcoded secrets; .env.example uses placeholders only. |
| XSS (markdown)    | Low risk | Trusted static markdown; no raw HTML. Add sanitization if you add rehype-raw or user content. |
| Link security     | Good     | `javascript:` blocked in editor; external links use noopener/noreferrer. |
| Env/config        | Good     | Sensitive values in env; no credentials in code. |

---

*Review date: 2026-02-19. Re-run checks after adding new content (e.g. legal pages, env vars, or markdown from new sources).*
