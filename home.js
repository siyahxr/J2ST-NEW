document.addEventListener('DOMContentLoaded', () => {

    /* ── Counter animation ─── */
    document.querySelectorAll('[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        if (isNaN(target)) return;
        let cur = 0;
        const step = () => {
            cur = Math.min(target, cur + Math.ceil(target / 80));
            el.textContent = cur.toLocaleString();
            if (cur < target) requestAnimationFrame(step);
        };
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { step(); io.disconnect(); } });
        io.observe(el);
    });

    /* ── Scroll nav shrink ─── */
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            nav.style.padding = '8px 14px';
            nav.style.top = '12px';
            nav.style.background = 'rgba(0,0,0,0.8)';
        } else {
            nav.style.padding = '10px 16px';
            nav.style.top = '20px';
            nav.style.background = 'rgba(0,0,0,0.5)';
        }
    });

    /* ── Session Aware UI ─── */
    const checkUserSession = () => {
        const session = localStorage.getItem('j2st_session_v2');
        if (session) {
            const navRight = document.querySelector('.nav-right');
            const heroBtn = document.querySelector('.hero-btn-row .btn-white');
            const ctaBtn = document.querySelector('.cta-input fieldset button');

            if (navRight) {
                navRight.innerHTML = `
                    <a href="dashboard.html" class="nl muted">Dashboard</a>
                    <a href="dashboard.html" class="nav-cta">Edit Profile →</a>
                `;
            }
            if (heroBtn) { 
                heroBtn.innerHTML = '<i class="ph ph-lightning-fill"></i> Go to Dashboard'; 
                heroBtn.href = "dashboard.html"; 
            }
            if (ctaBtn) { 
                ctaBtn.textContent = 'Go to Dashboard'; 
                ctaBtn.onclick = () => window.location.href="dashboard.html"; 
            }
        }
    };
    checkUserSession();

    /* ── Sync real profile from localStorage ─── */
    const BADGE_ICONS_STR = "activity,address-book,airplane,airplay,alarm,alien,anchor,android-logo,angular-logo,aperture,app-store-logo,app-window,apple-logo,archive,armchair,article,asterisk,at,atom,baby,backpack,bag,balloon,bank,barbell,barcode,baseball,basket,basketball,bathtub,battery-full,bed,beer-bottle,bell,bicycle,binoculars,bird,bluetooth,boat,bone,book,bookmark,boot,bowl-food,brain,brandy,bridge,briefcase,broadcast,broom,browser,bug,buildings,bus,butterfly,cactus,cake,calculator,calendar,camera,campfire,car,cardholder,cards,carrot,cat,certificate,chair,champagne,chart-bar,chat,check,church,circle,clipboard,clock,cloud,club,coat-hanger,code,coffee,coin,coins,columns,command,compass,computer-tower,confetti,cookie,copy,copyright,couch,cpu,credit-card,crop,cross,crosshair,crown,cube,currency-dollar,cursor,cylinder,database,desktop,device-mobile,device-tablet,diamond,dice-five,disc,discord-logo,dna,dog,door,download,drop,ear,egg,eject,elevator,engine,envelope,eraser,exam,eye,eyedropper,eyeglasses,factory,fan,feather,figma-logo,file,film-script,film-strip,fire,fire-extinguisher,first-aid,fish,fish-simple,flag,flag-banner,flag-checker,flag-pennant,flame,flashlight,flask,floppy-disk,flower,flower-lotus,flower-tulip,folder,folder-lock,folder-open,folder-star,folder-user,folders,football,footprints,fork-knife,frame-corners,framer-logo,function,funnel,funnel-simple,game-controller,garage,gas-pump,gauge,gear,gear-fine,gender-female,gender-intersex,gender-male,gender-neuter,gender-nonbinary,gender-transgender,ghost,gif,gift,git-branch,git-commit,git-diff,git-fork,git-merge,git-pull-request,github-logo,gitlab-logo,gitlab-logo-simple,globe,globe-hemisphere-east,globe-hemisphere-west,globe-stand,google-cardboard-logo,google-chrome-logo,google-drive-logo,google-logo,google-play-logo,google-podcasts-logo,gradient,graduation-cap,grains,grains-slash,graph,grid-four,grid-nine,guitar,hamburger,hammer,hand,hand-bag,hand-coins,hand-eye,hand-fist,hand-grabbing,hand-heart,hand-palm,hand-pointing,hand-soap,hand-swipe-left,hand-swipe-right,hand-tap,hand-waving,handbag,handbag-simple,headlights,headphones,headset,heart,heart-break,heart-straight,heart-straight-break,heartbeat,hexagon,highlighter-circle,hoodie,horse,hourglass,hourglass-high,hourglass-low,hourglass-medium,hourglass-simple,hourglass-simple-high,hourglass-simple-low,hourglass-simple-medium,house,house-line,house-simple,ice-cream,identification-badge,identification-card,image,image-square,infinity,info,instagram-logo,intersect,jeep,kanban,key,keyhole,keynote,knife,lamp,laptop,layout,leaf,lifebuoy,lightbulb,lightbulb-filament,lightning,lightning-a,line-segment,line-segments,link,link-break,link-simple,link-simple-break,linkedin-logo,linux-logo,list,list-bullets,list-checks,list-dashes,list-magnifying-glass,list-numbers,list-plus,lock,lock-key,lock-key-open,lock-laminated,lock-laminated-open,lock-open,lock-simple,lock-simple-open,lockers,magic-wand,magnet,magnet-straight,magnifying-glass,magnifying-glass-minus,magnifying-glass-plus,map-pin,map-pin-line,map-trifold,marker-circle,martini,mask-happy,mask-sad,math-operations,medal,medal-military,megaphone,megaphone-simple,messenger-logo,meta-logo,meteor,microphone,microphone-stage,microscope,minus,minus-circle,minus-square,money,monitor,monitor-play,moon,moon-stars,moped,moped-front,motorcycle,mountains,mouse,mouse-simple,music-note,music-note-simple,music-notes,music-notes-simple,navigation-arrow,needle,newspaper,newspaper-clipping,notches,note,note-blank,note-pencil,notebook,notepad,notification,nozzle,number-circle-eight,number-circle-five,number-circle-four,number-circle-nine,number-circle-one,number-circle-seven,number-circle-six,number-circle-three,number-circle-two,number-circle-zero,number-eight,number-five,number-four,number-nine,number-one,number-seven,number-six,number-square-eight,number-square-five,number-square-four,number-square-nine,number-square-one,number-square-seven,number-square-six,number-square-three,number-square-two,number-square-zero,number-three,number-two,number-zero,nut,ny-times-logo,octagon,office-chair,option,orange-slice,oven,package,paint-brush,paint-brush-broad,paint-bucket,paint-roller,palette,pants,paper-plane,paper-plane-right,paper-plane-tilt,paperclip,paperclip-horizontal,parachute,paragraph,parallelogram,park,password,path,patreon-logo,pause,pause-circle,paw-print,peace,pen,pen-nib,pen-nib-straight,pencil,pencil-circle,pencil-line,pencil-simple";
    const pIcons = BADGE_ICONS_STR.split(",");
    const BP = ['Void','Ether','Abyss','Nova','Aura','Soul','Frost','Zenith','Phantom','Storm','Light','Shadow','Neon','Eclipse','Prime','Titan','Star','Crest','Essence','Mythos'];
    const BC = ['Walker','Guardian','Oracle','Seeker','Lord','Phantom','Knight','Slayer','Ghost','Wraith','Spirit','Entity','Dragon','Master','Hunter','Protector','Warden','Saint'];
    const REGISTRY = [
        { name: 'Premium', icon: 'ph-crown' },
        { name: 'Verified', icon: 'ph-shield-check' },
        { name: 'OG', icon: 'ph-diamond' },
        { name: 'Booster', icon: 'ph-rocket-launch' },
        { name: 'Developer', icon: 'ph-code' },
        { name: 'Staff', icon: 'ph-identification-badge' }
    ];
    for (let i = 1; i <= 294; i++) {
        REGISTRY.push({ name: `${BP[i % 20]} ${BC[i % 18]} #${i}`, icon: `ph-${pIcons[i] || 'star'}` });
    }

    const SOCIAL_ICONS = {
        instagram: 'ph-instagram-logo', twitter: 'ph-twitter-logo', x: 'ph-twitter-logo',
        discord: 'ph-discord-logo', twitch: 'ph-twitch-logo', tiktok: 'ph-tiktok-logo',
        steam: 'ph-steam-logo', youtube: 'ph-youtube-logo', github: 'ph-github-logo',
        linkedin: 'ph-linkedin-logo'
    };

    function syncProfile() {
        const raw = localStorage.getItem('j2st_settings');
        if (!raw) return;
        let d;
        try { d = JSON.parse(raw); } catch { return; }

        const av       = document.getElementById('card-av');
        const avWrap   = av ? av.parentElement : null;
        const nameEl   = document.getElementById('card-name');
        const bioEl    = document.getElementById('card-bio');
        const badgesEl = document.getElementById('card-badges');
        const linksEl  = document.getElementById('card-links');
        const urlEl    = document.getElementById('bar-url');
        const bannerEl = document.getElementById('card-banner');
        const btnPp    = document.querySelector('.btn-pp');
        const samplePp = document.getElementById('sample-pp');

        /* URL */
        if (d.displayName && urlEl)
            urlEl.textContent = `j2st.lol/${d.displayName.toLowerCase().replace(/\s+/g,'')}`;

        /* Banner */
        if (bannerEl) {
            if (d.banner) {
                bannerEl.style.backgroundImage = `url(${d.banner})`;
                bannerEl.style.backgroundSize  = 'cover';
                bannerEl.style.backgroundPosition = 'center';
            }
        }

        /* Avatar */
        if (d.avatar && av && avWrap) {
            avWrap.style.overflow = 'hidden';
            av.src = d.avatar;
            av.classList.add('real');
            av.style.cssText = 'width:100% !important;height:100% !important;object-fit:cover !important;transform:none !important;border-radius:50%;';
            if (samplePp) { samplePp.src = d.avatar; samplePp.classList.add('loaded'); }
            if (btnPp)    { btnPp.src = d.avatar; btnPp.classList.add('loaded'); }
        }

        /* Name */
        if (d.displayName && nameEl) nameEl.textContent = d.displayName;

        /* Bio */
        if (d.bio && bioEl) bioEl.textContent = d.bio;

        /* Badges */
        if (d.badges && d.badges.length && badgesEl) {
            badgesEl.innerHTML = '';
            d.badges.forEach(bn => {
                const b = REGISTRY.find(r => r.name === bn);
                if (b) badgesEl.innerHTML += `<i class="ph ${b.icon}" style="color:${d.badgeColor||'#fff'}"></i>`;
            });
        }

        /* Links */
        if (d.links && d.links.length && linksEl) {
            linksEl.innerHTML = '';
            d.links.slice(0, 3).forEach(link => {
                const lc   = (link.platform || '').toLowerCase();
                const icon = SOCIAL_ICONS[lc] || 'ph-link';
                linksEl.innerHTML += `<div class="cl-item" style="color:${d.linkColor||'#fff'}">
                    <i class="ph ${icon}"></i><span>${link.username || link.platform}</span>
                </div>`;
            });
        }
    }

    /* ── Render Discover grid ─── */
    function renderDiscover() {
        const grid    = document.getElementById('disc-grid');
        const empty   = document.getElementById('disc-empty');
        if (!grid) return;

        let dir = [];
        try { dir = JSON.parse(localStorage.getItem('j2st_directory') || '[]'); } catch {}

        // Also include current user if they have a profile but haven't saved yet
        const currentRaw = localStorage.getItem('j2st_settings');
        if (currentRaw) {
            try {
                const c = JSON.parse(currentRaw);
                if (c.displayName && !dir.find(u => u.displayName === c.displayName)) {
                    dir.unshift({
                        displayName: c.displayName,
                        bio: c.bio || '',
                        avatar: c.avatar || '',
                        banner: c.banner || '',
                        badges: (c.badges || []).slice(0, 5),
                        badgeColor: c.badgeColor || '#ffffff',
                        links: (c.links || []).slice(0, 3)
                    });
                }
            } catch {}
        }

        if (!dir.length) { if (empty) empty.style.display = 'flex'; return; }
        if (empty) empty.style.display = 'none';

        // Badge lookup helper
        const getBadgeIcon = name => {
            const b = REGISTRY.find(r => r.name === name);
            return b ? b.icon : 'ph-star';
        };

        dir.forEach(user => {
            const slug = (user.displayName || 'user').toLowerCase().replace(/\s+/g, '');
            const card = document.createElement('div');
            card.className = 'disc-card';
            card.onclick = () => window.location.href = `profile.html?u=${encodeURIComponent(user.displayName)}`;

            // Banner
            let bannerStyle = '';
            if (user.banner) {
                bannerStyle = `background-image:url(${user.banner});background-size:cover;background-position:center;`;
            }

            // Avatar
            let avHtml = '';
            if (user.avatar) {
                avHtml = `<img src="${user.avatar}" class="disc-av" style="width:100%;height:100%;object-fit:cover;">`;
            } else {
                avHtml = `<img src="assest/j2st.logo.png" class="disc-av logo" style="transform:scale(5);width:100%;height:100%;object-fit:contain;">`;
            }

            // Badges
            let badgesHtml = '';
            (user.badges || []).slice(0, 4).forEach(bn => {
                badgesHtml += `<i class="ph ${getBadgeIcon(bn)}" style="color:${user.badgeColor||'#fff'}"></i>`;
            });

            card.innerHTML = `
                <div class="disc-banner" style="${bannerStyle}"></div>
                <div class="disc-body">
                    <div class="disc-av-wrap">${avHtml}</div>
                    <div class="disc-name">${user.displayName || 'Unknown'}</div>
                    <div class="disc-bio">${user.bio || 'No bio yet.'}</div>
                    ${badgesHtml ? `<div class="disc-badges">${badgesHtml}</div>` : ''}
                    <a href="profile.html?u=${encodeURIComponent(user.displayName)}" class="disc-view-btn" onclick="event.stopPropagation()">
                        <i class="ph ph-arrow-square-out"></i>
                        View Profile
                    </a>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    async function fetchHomeCardProfile(username) {
        try {
            const res = await fetch(`/api/auth/profile?u=${encodeURIComponent(username)}`);
            const user = await res.json();
            if (!user.username) return;

            const nameEl   = document.getElementById('card-name');
            const bioEl    = document.getElementById('card-bio');
            const av       = document.getElementById('card-av');
            const badgesEl = document.getElementById('card-badges');
            const bannerEl = document.getElementById('card-banner');

            if (nameEl) nameEl.textContent = user.username === '$' ? '$siyah' : user.username;
            if (bioEl) bioEl.textContent = user.bio || 'Your bio here';
            if (av && user.avatar) {
                av.src = user.avatar;
                av.style.width = '100%';
                av.style.height = '100%';
                av.style.objectFit = 'cover';
                av.style.borderRadius = '20%';
            }
            if (bannerEl && user.banner) {
                bannerEl.style.backgroundImage = `url(${user.banner})`;
                bannerEl.style.backgroundSize = 'cover';
            }
            if (badgesEl && user.badges) {
                badgesEl.innerHTML = '';
                user.badges.forEach(bn => {
                    const b = REGISTRY.find(r => r.name === bn);
                    if (b) badgesEl.innerHTML += `<i class="ph ${b.icon}" style="color:${user.badgeColor||'#fff'}"></i>`;
                });
            }
        } catch (e) {
            console.error("Home card fetch failed.");
        }
    }

    if (localStorage.getItem('j2st_session_v2')) {
        syncProfile();
    } else {
        fetchHomeCardProfile('$');
    }

    renderDiscover();
});
