/**
 * Cloudflare Pages Function — GitHub OAuth: Step 1
 * Route: /api/auth
 */
export async function onRequest(context) {
    // .trim() handles accidental spaces in Cloudflare vars
    const clientId = context.env.GITHUB_CLIENT_ID?.trim();

    if (!clientId) {
        return new Response('Error: GITHUB_CLIENT_ID not found in environment.', { status: 500 });
    }

    const url = new URL(context.request.url);
    const state = url.searchParams.get('state');

    // Construct absolute callback URL
    const redirectUri = encodeURIComponent(`${url.origin}/api/callback`);
    const scope = 'repo,user';

    let githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    // Pass through the 'state' parameter (prevent CSRF issues in CMS)
    if (state) {
        githubUrl += `&state=${encodeURIComponent(state)}`;
    }

    return Response.redirect(githubUrl, 302);
}
