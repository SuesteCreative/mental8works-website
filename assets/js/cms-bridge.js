
document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;
    const isBlogListPage = path.includes('/blog/') && !path.includes('/posts/');
    const isHomePage = path.endsWith('/') || (path.endsWith('index.html') && !path.includes('/blog/'));

    // Helper: determine base path depending on page depth
    const basePath = (path.includes('/blog/') || path.includes('/sobre-nos/') || path.includes('/contactos/') || path.includes('/agendamentos/') || path.includes('/socios/') || path.includes('/equipa/')) ? '../' : '';

    // 1. Load General Settings (contacts, social links)
    try {
        const settingsResponse = await fetch(`${basePath}data/settings.json?v=${new Date().getTime()}`);
        if (settingsResponse.ok) {
            const settings = await settingsResponse.json();

            // Update mailto links
            document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
                if (settings.email) {
                    el.textContent = settings.email;
                    el.href = `mailto:${settings.email}`;
                }
            });

            // Update social links in footer
            if (settings.facebook) {
                document.querySelectorAll('a[href*="facebook.com"]').forEach(el => el.href = settings.facebook);
            }
            if (settings.instagram) {
                document.querySelectorAll('a[href*="instagram.com"]').forEach(el => el.href = settings.instagram);
            }
            // LinkedIn removed as per client request

        }
    } catch (e) { console.warn('Settings not loaded:', e); }

    // 2. Home Page Logic
    if (isHomePage) {
        try {
            const homeResponse = await fetch(`data/home.json?v=${new Date().getTime()}`);
            if (!homeResponse.ok) return;
            const homeData = await homeResponse.json();

            // Hero
            if (homeData.hero) {
                const dynamicWordEl = document.getElementById('dynamic-word');
                if (dynamicWordEl && homeData.hero.words && homeData.hero.words.length > 0) {
                    // Extract first word (handle string or object array)
                    const firstWord = typeof homeData.hero.words[0] === 'object'
                        ? homeData.hero.words[0].word
                        : homeData.hero.words[0];
                    dynamicWordEl.textContent = firstWord;
                }

                const heroSub = document.querySelector('.hero-content p');
                if (heroSub && homeData.hero.subheading) heroSub.textContent = homeData.hero.subheading;
                const heroImg = document.querySelector('.hero-banner');
                if (heroImg && homeData.hero.image) heroImg.src = homeData.hero.image;
            }

            // Mission
            if (homeData.mission) {
                const missionP = document.querySelector('.about-grid p');
                if (missionP && homeData.mission.text) missionP.textContent = homeData.mission.text;

                if (homeData.mission.bubbles) {
                    const bubbles = document.querySelectorAll('.float-card');
                    homeData.mission.bubbles.forEach((text, i) => {
                        if (bubbles[i]) bubbles[i].textContent = text;
                    });
                }
            }
        } catch (e) { console.error('Home data error:', e); }
    }

    // 3. Blog Listing Page Logic
    if (isBlogListPage) {
        const blogContainer = document.getElementById('blog-posts-container');
        if (!blogContainer) return;

        try {
            const indexResponse = await fetch('/data/blog-index.json');
            if (!indexResponse.ok) throw new Error(`Blog index fetch failed: ${indexResponse.status}`);
            const posts = await indexResponse.json();

            if (!posts || posts.length === 0) {
                blogContainer.innerHTML = '<p class="text-center" style="grid-column:1/-1;opacity:0.6;">Nenhum artigo publicado ainda.</p>';
                return;
            }

            blogContainer.innerHTML = posts.map(post => {
                return `
                    <a href="posts/${post.slug}/index.html" class="card blog-card">
                        <div class="blog-card-img-wrapper">
                            <img src="${post.image}" alt="${post.title}" loading="lazy">
                        </div>
                        <div class="blog-content">
                            <h3>${post.title}</h3>
                            <p>${post.summary}</p>
                            <span style="color: var(--color-primary); font-weight: 600;">Ler mais &rarr;</span>
                        </div>
                    </a>
                `;
            }).join('');

        } catch (e) {
            console.warn('Blog index not found, trying to load individual posts...');
            blogContainer.innerHTML = '<p class="text-center" style="grid-column:1/-1;opacity:0.6;">Nenhum artigo encontrado.</p>';
        }
    }

    // 4. Team Page Logic
    const isTeamPage = path.includes('/equipa/');
    if (isTeamPage) {
        const teamContainer = document.getElementById('team-members-container');
        if (teamContainer) {
            try {
                // Check if page should be visible or show Under Construction
                let isPageActive = true;
                try {
                    const settingsRes = await fetch(`${basePath}data/team_settings.json?v=${new Date().getTime()}`);
                    if (settingsRes.ok) {
                        const s = await settingsRes.json();
                        isPageActive = s.active;
                    }
                } catch (e) { console.warn('Team settings not loaded, defaulting to active'); }

                if (!isPageActive) {
                    // Show UC section (handled by the static HTML overlay usually, 
                    // but here we ensure the container only shows the UC message if we want)
                    // If the static HTML already has the UC message, we just don't hide it.
                    return;
                }

                const members = [
                    'maria-silva',     // Psicologia (Presidente/Senior)
                    'pedro-neto-cunha', // Psicologia (Conselho Fiscal)
                    'alexandre-horacio', // Psicologia (Tesoureiro)
                    'simone-vieira',    // Psicologia
                    'joao-revez-lopes'  // Psiquiatria
                ];

                const memberData = await Promise.all(members.map(async (m) => {
                    try {
                        const res = await fetch(`${basePath}data/equipa/${m}.json`);
                        return res.ok ? await res.json() : null;
                    } catch { return null; }
                }));

                const activeMembers = memberData.filter(m => m !== null);

                // Group by specialty
                const psiquiatria = activeMembers.filter(m => m.role && m.role.toLowerCase().includes('psiq'));
                const psicologia = activeMembers.filter(m => m.role && (m.role.toLowerCase().includes('psicól') || m.role.toLowerCase().includes('psicot')));

                let html = '';

                if (psiquiatria.length > 0) {
                    html += `
                        <div style="grid-column: 1 / -1; margin: 3rem 0 1.5rem; text-align: left;">
                            <h2 style="color: var(--color-primary); border-bottom: 2px solid var(--color-secondary); display: inline-block; padding-bottom: 5px; font-size: 1.8rem;">Psiquiatria</h2>
                        </div>
                    `;
                    html += psiquiatria.map(renderMember).join('');
                }

                if (psicologia.length > 0) {
                    html += `
                        <div style="grid-column: 1 / -1; margin: 4rem 0 1.5rem; text-align: left;">
                            <h2 style="color: var(--color-primary); border-bottom: 2px solid var(--color-secondary); display: inline-block; padding-bottom: 5px; font-size: 1.8rem;">Psicologia Clínica</h2>
                        </div>
                    `;
                    html += psicologia.map(renderMember).join('');
                }

                if (html) {
                    teamContainer.innerHTML = html;
                }

            } catch (e) {
                console.error('Error loading team:', e);
            }
        }
    }

    function renderMember(m) {
        return `
            <div class="card team-card reveal">
                <div class="team-img-wrapper">
                    <img src="${basePath}${m.photo.startsWith('/') ? m.photo.substring(1) : m.photo}" alt="${m.name}" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 style="margin-bottom: 0.25rem;">${m.name}</h3>
                    <p style="color: var(--color-primary); font-weight: 600; font-size: 0.9rem; margin-bottom: 1rem;">${m.role}</p>
                    <ul style="list-style: none; padding: 0; font-size: 0.85rem; opacity: 0.8;">
                        ${m.bio_items.map(item => `<li style="margin-bottom: 0.5rem; line-height: 1.4;">• ${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
});

