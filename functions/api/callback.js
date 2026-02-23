/**
 * Cloudflare Pages Function — GitHub OAuth: Step 2
 * Route: /api/callback
 *
 * GitHub redirects here after the user authorizes the app.
 * Exchanges the temporary code for an access token and posts
 * it back to the Decap CMS popup window.
 *
 * Environment variables required (set in Cloudflare Pages → Settings → Environment variables):
 *   GITHUB_CLIENT_ID     — from your GitHub OAuth App
 *   GITHUB_CLIENT_SECRET — from your GitHub OAuth App (keep secret!)
 */
export async function onRequestGet(context) {
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state') ?? '';
    const error = url.searchParams.get('error');

    // ── Handle user denial ────────────────────────────────────────
    if (error) {
        const html = buildScript('error', { error });
        return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    if (!code) {
        return new Response('Missing code parameter.', { status: 400 });
    }

    // ── Exchange code for access token ────────────────────────────
    const clientId = context.env.GITHUB_CLIENT_ID;
    const clientSecret = context.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return new Response('Missing OAuth environment variables.', { status: 500 });
    }

    let token;
    try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mental8Works-CMS',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                state,
            }),
        });

        const data = await tokenResponse.json();

        if (data.error) {
            const html = buildScript('error', { error: data.error_description || data.error });
            return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }

        token = data.access_token;
    } catch (err) {
        const html = buildScript('error', { error: `Failed to fetch token: ${err.message}` });
        return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // ── Post token back to Decap CMS opener window ───────────────
    const html = buildScript('success', { token, provider: 'github' });
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// ── Helper: build the postMessage HTML snippet ─────────────────
function buildScript(status, payload) {
    const message =
        status === 'success'
            ? `authorization:github:success:${JSON.stringify(payload)}`
            : `authorization:github:error:${JSON.stringify(payload)}`;

    return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><title>A autenticar...</title></head>
<body>
<p style="font-family:sans-serif;padding:2rem;">A processar autenticação…</p>
<script>
(function () {
  function sendMessage(e) {
    window.opener.postMessage(${JSON.stringify(message)}, e.origin);
    window.removeEventListener('message', sendMessage, false);
  }
  window.addEventListener('message', sendMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body>
</html>`;
}
