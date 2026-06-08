// Supabase Edge Function: claude
// ---------------------------------
// A thin proxy in front of the Anthropic Messages API. The browser app
// (index.html) POSTs the same body it would send to Anthropic; this function
// injects the API key and required version header server-side, so the key is
// never exposed to the client.
//
// Deploy:   supabase functions deploy claude --no-verify-jwt
// Secret:   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// The function is deployed with --no-verify-jwt so the static page can call it
// without a Supabase auth token. That means anyone who finds the URL can spend
// your Anthropic credits — see SETUP.md for how to add an allowed-origin check
// or a shared secret if you need to lock it down.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return json({ error: "ANTHROPIC_API_KEY is not set on the server" }, 500);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
    });

    // Pass the Anthropic response straight back (status + body), plus CORS.
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return json({ error: "Upstream request failed", detail: String(err) }, 502);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
