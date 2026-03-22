export async function onRequestGet(context) {
    const { env, params } = context;
    const username = params.username;

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    const usernameLower = username.toLowerCase();
    const isMaster = (usernameLower === '$' || usernameLower === 'siyah');
    
    // Fetch user from KV
    const uRaw = await env.J2ST_DB.get(`user:${usernameLower}`);
    
    // Fallback for Master User $ or siyah if not found or no settings
    if (!uRaw && isMaster) {
        return new Response(JSON.stringify({ 
            success: true, 
            profile: {
                username: "$", 
                displayName: "siyah",
                bio: "Master of the void collective.",
                avatar: "https://j2st.lol/assest/icons/user_dragon.png",
                accent: "#ffffff",
                glow: 15,
                opacity: 70,
                badges: ["Premium", "Verified", "OG", "Booster", "Developer", "Staff", "J2ST"],
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
    let profile = u.profileSettings || { 
        username: u.username, 
        displayName: u.username,
        bio: "Joined the void collective.",
        avatar: "https://j2st.lol/assest/icons/user_dragon.png"
    };

    // OMNIPOTENCE: Always grant elite status to the master account
    if (isMaster) {
        const eliteBadges = ["Premium", "Verified", "OG", "Booster", "Developer", "Staff", "J2ST"];
        if (!profile.badges) profile.badges = [];
        // Unique merge
        eliteBadges.forEach(b => {
             if(!profile.badges.includes(b)) profile.badges.push(b);
        });
        
        // Force the name and handle if it was lost
        if (!profile.username || profile.username === 'undefined') profile.username = '$';
    }

    return new Response(JSON.stringify({ 
        success: true, 
        profile: profile
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
