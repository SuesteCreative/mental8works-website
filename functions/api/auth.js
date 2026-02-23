/**
 * Cloudflare Pages Function — GitHub OAuth: Step 1
 * Route: /api/auth
 *
 * Redirects the user to GitHub to authorize the OAuth App.
 * The GITHUB_CLIENT_ID environment variable must be set in
 * the Cloudflare Pages project settings.
 */
export async function onRequest(context) {
    const clientId = context.env.GITHUB_CLIENT_ID;

    if (!clientId) {
        return new Response('Missing GITHUB_CLIENT_ID environment variable.', { status: 500 });
    }

    const redirectUri = encodeURIComponent(`${new URL(context.request.url).origin}/api/callback`);
    const scope = 'repo,user';
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    return Response.redirect(githubUrl, 302);
}
