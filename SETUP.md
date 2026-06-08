# Evercrafted Prompt Studio — Setup

`index.html` is the whole app: a single-file Midjourney prompt studio (Studio,
Collection Builder, Lifestyle Prompts, Lookbook, How-To). No build step.

Everything except the ✦ AI features works by just opening the file. The AI
features (emotional brief → config, refine, collection design, story mode,
lookbook captions) call Claude through a small **Supabase Edge Function** that
holds the Anthropic API key server-side — so the key is never shipped to the
browser.

ElevenLabs voice narration is independent: it prompts the user for their own key
and stores it in their browser. No setup needed.

## 1. Deploy the Claude proxy (one time)

You need the [Supabase CLI](https://supabase.com/docs/guides/cli) and an
Anthropic API key.

```bash
# from the repo root
supabase link --project-ref qybnmlqesnbmgxayhllf

# store your Anthropic key as a server-side secret (never in the HTML)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxx

# deploy the function (public — no Supabase auth token required)
supabase functions deploy claude --no-verify-jwt
```

The function lives at:

```
https://qybnmlqesnbmgxayhllf.supabase.co/functions/v1/claude
```

That URL is already hardcoded in `index.html` as `CLAUDE_PROXY_URL` (top of the
`<script>` block). If you deploy to a different project, update that constant.

## 2. Serve the page

It's a static file — host it anywhere:

```bash
# quick local check
python3 -m http.server 8080
# then open http://localhost:8080/index.html
```

Or drop `index.html` on Netlify / Vercel / GitHub Pages / S3 / any static host.

## 3. Verify

Open the page, type a feeling into the **Emotional Brief** box at the top of the
Studio tab, and click **Configure**. If the form auto-fills, the proxy is
working. If you get "Something went wrong", check:

- `supabase secrets list` shows `ANTHROPIC_API_KEY`
- `supabase functions list` shows `claude` deployed
- browser devtools → Network → the `claude` request and its response body

## Model

All AI calls use `claude-sonnet-4-6`. To change it, search `index.html` for
`model:` (7 call sites) — or the model could be centralized later.

## Security note

The proxy is deployed `--no-verify-jwt`, so anyone with the URL can spend your
Anthropic credits. For a private/internal tool that's usually fine. To lock it
down, add one of these to `supabase/functions/claude/index.ts`:

- **Origin allowlist** — check `req.headers.get("origin")` against your domain
  and reject others (also tighten `Access-Control-Allow-Origin`).
- **Shared secret** — have `index.html` send a header the function checks
  against another Supabase secret.

Re-deploy after either change.
