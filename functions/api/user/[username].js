export async function onRequestGet(context) {
    const { env, params } = context;
    const username = params.username || "";

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    const usernameLower = decodeURIComponent(username).toLowerCase();
    const isMaster = (usernameLower === '$' || usernameLower === 'siyah' || usernameLower === 'admin');
    
    // Fetch user from KV - try both possible master IDs
    let uRaw = await env.J2ST_DB.get(`user:${usernameLower}`);
    let otherRaw = null;
    if (isMaster) {
        const otherId = (usernameLower === '$') ? 'siyah' : '$';
        otherRaw = await env.J2ST_DB.get(`user:${otherId}`);
    }

    // Prioritize the one that has actual settings
    if (isMaster && otherRaw) {
        if (!uRaw) {
            uRaw = otherRaw;
        } else {
            const uCurrent = JSON.parse(uRaw);
            const uOther = JSON.parse(otherRaw);
            if (!uCurrent.profileSettings && uOther.profileSettings) {
                uRaw = otherRaw;
            }
        }
    }
    
    // Fallback for Master User $ or siyah if ABSOLUTELY no record exists
    if (!uRaw && isMaster) {
        return new Response(JSON.stringify({ 
            success: true, 
            profile: {
                username: "$", 
                displayName: "$",
                bio: "Master of the void collective.",
                avatar: "avatar.webp",
                accent: "#ffffff",
                glow: 15,
                opacity: 70,
                badges: ["Premium", "Beta Tester", "OG", "Booster", "Developer", "Staff", "J2ST"],
                badgeColor: "#ffffff",
                views: 1337,
                joined: "The Beginning"
            }
        }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (!uRaw) {
        return new Response(JSON.stringify({ success: false, error: "User not found." }), { status: 404 });
    }

    const u = JSON.parse(uRaw);
    if (u.is_banned) {
        return new Response(JSON.stringify({ 
            success: true, 
            profile: {
                username: usernameLower,
                displayName: "ACCESS DENIED",
                is_suspended: true,
                accent: "#ff0000"
            }
        }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    let profile = { ...(u.profileSettings || {}) };
    // Explicitly clear suspension flags if not banned to avoid cached/stale data
    delete profile.is_suspended;
    delete profile.suspended;
    
    // Ensure base properties exist if settings were partial
    
    // Ensure base properties exist if settings were partial
    if (!profile.username) profile.username = u.username || usernameLower;
    if (!profile.displayName) profile.displayName = u.username || usernameLower;
    if (!profile.avatar) profile.avatar = "avatar.webp";
    if (!profile.bio) profile.bio = "Joined the void collective.";

    // OMNIPOTENCE: Give admin status, but respect saved aesthetics
    if (isMaster) {
        const eliteBadges = ["Premium", "Beta Tester", "OG", "Booster", "Developer", "Staff", "J2ST"];
        if (!profile.badges) profile.badges = [];
        // Unique merge
        eliteBadges.forEach(b => {
             if(!profile.badges.includes(b)) profile.badges.push(b);
        });
        
        // Force the master identity handles
        profile.username = '$';
        profile.displayName = '$';
        
        // ONLY set defaults if they were never customized
        if (!profile.badgeColor) profile.badgeColor = '#ffffff';
        if (!profile.accent) profile.accent = '#ffffff';
        // Only force avatar if it was the dead dragon icon
        if (profile.avatar && profile.avatar.includes('user_dragon')) {
            profile.avatar = "avatar.webp";
        }
    }

    return new Response(JSON.stringify({ 
        success: true, 
        profile: profile
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
