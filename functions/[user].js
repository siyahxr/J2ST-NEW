export async function onRequest(context) {
    const { request, env, params } = context;
    const username = params.user;

    // List of static paths to skip (lowercase, both with and without .html)
    const skips = [
        'assest', 'api', 'home.css', 'auth.css', 'profile.css', 'index.css', 'dashboard.css', 
        'index.html', 'login.html', 'register.html', 'dashboard.html', 'profile.html', 'discover.html', 'invite.html', 'verify.html', 
        'home.js', 'auth.js', 'dashboard.js', 'bot.js', 
        'index', 'login', 'register', 'dashboard', 'discover', 'invite', 'verify',
        'wrangler.toml', '_redirects', 'favicon.ico', '.env', 'keys.db.json', 'users.db.json'
    ];
    
    if (skips.includes(username.toLowerCase()) || username.includes('.')) {
        return context.next();
    }

    // Vanity redirect to profile.html
    const url = new URL(request.url);
    return new Response(null, {
        status: 302,
        headers: { 'Location': `/profile.html?u=${encodeURIComponent(username)}` }
    });
}
