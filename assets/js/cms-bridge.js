
document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;
    const isBlogListPage = path.includes('/blog/') && !path.includes('/posts/');
    const isHomePage = path.endsWith('/') || (path.endsWith('index.html') && !path.includes('/blog/'));

    // Helper: determine base path depending on page depth
    const basePath = (path.includes('/blog/') || path.includes('/about-us/') || path.includes('/contactos/') || path.includes('/agendamentos/') || path.includes('/socios/') || path.includes('/team/')) ? '../' : '';

    // 1. Load General Settings (contacts, social links)
    try {
        const settingsResponse = await fetch(`${basePath}data/settings.json`);
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
            if (settings.linkedin) {
                document.querySelectorAll('a[href*="linkedin.com"]').forEach(el => el.href = settings.linkedin);
            }
        }
    } catch (e) { console.warn('Settings not loaded:', e); }

    // 2. Home Page Logic
    if (isHomePage) {
        try {
            const homeResponse = await fetch('data/home.json');
            if (!homeResponse.ok) return;
            const homeData = await homeResponse.json();

            // Hero
            if (homeData.hero) {
                const h1 = document.querySelector('.hero-content h1');
                if (h1 && homeData.hero.title_prefix && homeData.hero.words) {
                    h1.innerHTML = `${homeData.hero.title_prefix} <span id="dynamic-word" style="color: var(--color-primary);">${homeData.hero.words[0]}</span>`;
                    window.CMS_DYNAMIC_WORDS = homeData.hero.words;
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
            const indexResponse = await fetch('../data/blog-index.json');
            if (!indexResponse.ok) throw new Error('Index not found');
            const posts = await indexResponse.json();

            if (!posts || posts.length === 0) {
                blogContainer.innerHTML = '<p class="text-center" style="grid-column:1/-1;opacity:0.6;">Nenhum artigo publicado ainda.</p>';
                return;
            }

            blogContainer.innerHTML = posts.map(post => {
                const date = new Date(post.date).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' });
                return `
                    <a href="posts/${post.slug}/index.html" class="card blog-card">
                        <div class="blog-card-img-wrapper">
                            <img src="${post.image}" alt="${post.title}" loading="lazy">
                        </div>
                        <div class="blog-content">
                            <p style="font-size:0.8rem; opacity:0.6; margin-bottom:0.5rem;">${date}</p>
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
});
