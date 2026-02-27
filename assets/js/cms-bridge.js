
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

            // Update addresses and visibility
            if (settings.addresses) {
                const sede = settings.addresses.sede;
                const cons = settings.addresses.consultorio;

                // 1. Update Footer (look for span with address content)
                const footerSpans = document.querySelectorAll('.footer-col span, .footer-col ul li span');
                footerSpans.forEach(span => {
                    if (span.innerHTML.includes('Sede:') || span.innerHTML.includes('Consultório:')) {
                        let html = '';
                        if (sede && sede.sede_visible) {
                            html += `<strong>Sede:</strong> ${sede.sede_address}`;
                        }
                        if (cons && cons.consultorio_visible) {
                            if (html) html += '<br>';
                            html += `<strong>Consultório:</strong> ${cons.consultorio_address}`;
                        }
                        span.innerHTML = html;

                        // Hide the whole <li> if nothing is visible
                        const li = span.closest('li');
                        if (li) {
                            li.style.display = html ? 'flex' : 'none';
                        }
                    }
                });

                // 2. Update Contact Page (if it exists)
                const contactsInfo = document.querySelector('.contact-info div');
                if (contactsInfo) {
                    const pTags = contactsInfo.querySelectorAll('p');
                    pTags.forEach(p => {
                        if (p.textContent === 'Sede') {
                            const isVisible = !!(sede && sede.sede_visible);
                            p.style.display = isVisible ? 'block' : 'none';
                            const nextP = p.nextElementSibling;
                            if (nextP) {
                                nextP.style.display = isVisible ? 'block' : 'none';
                                if (sede && sede.sede_address) nextP.textContent = sede.sede_address;
                            }
                        }
                        if (p.textContent === 'Consultório') {
                            const isVisible = !!(cons && cons.consultorio_visible);
                            p.style.display = isVisible ? 'block' : 'none';
                            const nextP = p.nextElementSibling;
                            if (nextP) {
                                nextP.style.display = isVisible ? 'block' : 'none';
                                if (cons && cons.consultorio_address) nextP.textContent = cons.consultorio_address;
                            }
                        }
                    });
                }
            }
        }
    } catch (e) { console.warn('Settings not loaded:', e); }

    // 2. Home Page Logic
    if (isHomePage) {
        try {
            const homeResponse = await fetch(`data/home.json?v=${new Date().getTime()}`);
            if (homeResponse.ok) {
                const homeData = await homeResponse.json();

                // Hero
                if (homeData.hero) {
                    const dynamicWordEl = document.getElementById('dynamic-word');
                    if (dynamicWordEl && homeData.hero.words && homeData.hero.words.length > 0) {
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
            }
        } catch (e) { console.error('Home data error:', e); }
    }

    // 3. Blog Listing Page Logic
    if (isBlogListPage) {
        const blogContainer = document.getElementById('blog-posts-container');
        if (blogContainer) {
            try {
                const indexResponse = await fetch('/data/blog-index.json');
                if (indexResponse.ok) {
                    const posts = await indexResponse.json();
                    if (!posts || posts.length === 0) {
                        blogContainer.innerHTML = '<p class="text-center" style="grid-column:1/-1;opacity:0.6;">Nenhum artigo publicado ainda.</p>';
                    } else {
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
                    }
                }
            } catch (e) { console.error('Blog index error:', e); }
        }
    }

    // 4. Team Page Logic
    if (path.includes('/equipa/')) {
        try {
            // Team Status Check
            const statusResponse = await fetch('../data/team_settings.json');
            if (statusResponse.ok) {
                const settings = await statusResponse.json();
                if (settings.active === false) {
                    const teamSection = document.querySelector('.section-team');
                    if (teamSection) {
                        teamSection.innerHTML = `
                            <div class="container text-center" style="padding: 100px 20px;">
                                <img src="../assets/images/team-construction.png" alt="Equipa em Construção" style="max-width: 400px; margin-bottom: 2rem; opacity: 0.8;">
                                <h2 style="color: var(--color-primary);">A nossa equipa está a crescer</h2>
                                <p style="font-size: 1.2rem; opacity: 0.7;">Estamos a atualizar a nossa lista de especialistas para melhor o servir. Volte brevemente.</p>
                                <a href="../index.html" class="btn btn-primary" style="margin-top: 2rem;">Voltar ao Início</a>
                            </div>
                        `;
                    }
                    return;
                }
            }

            // Load Team Members
            const members = [
                'maria-silva',     // Psicologia (Presidente/Senior)
                'pedro-neto-cunha', // Psicologia (Conselho Fiscal)
                'alexandre-horacio', // Psicologia (Tesoureiro)
                'simone-vieira',    // Psicologia
                'joao-revez-lopes'  // Psiquiatria
            ];

            const memberData = await Promise.all(members.map(async (m) => {
                const res = await fetch(`../data/equipa/${m}.json`);
                return res.ok ? await res.json() : null;
            }));

            const validMembers = memberData.filter(m => m !== null);

            // Render Members
            const psychiatryGrid = document.querySelector('#psychiatry-grid');
            const psychologyGrid = document.querySelector('#psychology-grid');

            if (psychiatryGrid && psychologyGrid) {
                psychiatryGrid.innerHTML = '';
                psychologyGrid.innerHTML = '';

                validMembers.forEach(m => {
                    const card = `
                        <div class="card team-card reveal">
                            <div class="team-img-wrapper">
                                <img src="${m.photo}" alt="${m.name}">
                            </div>
                            <div class="team-info">
                                <h3>${m.name}</h3>
                                <p class="role">${m.role}</p>
                                <ul class="bio-list">
                                    ${m.bio_items.map(item => `<li>${item}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `;

                    if (m.role.toLowerCase().includes('psiquiatria') || m.role.toLowerCase().includes('psiquiatra')) {
                        psychiatryGrid.insertAdjacentHTML('beforeend', card);
                    } else {
                        psychologyGrid.insertAdjacentHTML('beforeend', card);
                    }
                });
            }
        } catch (e) { console.error('Team loading error:', e); }
    }
});
