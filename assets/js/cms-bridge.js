
document.addEventListener('DOMContentLoaded', async () => {
    const isBlogPage = window.location.pathname.includes('/blog/');
    const isHomePage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html') && !isBlogPage;

    // 1. Carregar Dados de Configuração Geral (Contactos)
    try {
        const settingsPath = isHomePage ? 'data/settings.json' : '../data/settings.json';
        const settingsResponse = await fetch(settingsPath);
        if (settingsResponse.ok) {
            const settings = await settingsResponse.json();

            // Atualizar Email nos mailto:
            document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
                el.textContent = settings.email;
                el.href = `mailto:${settings.email}`;
            });

            // Atualizar Redes Sociais no footer
            const socialLinks = {
                facebook: settings.facebook,
                instagram: settings.instagram,
                linkedin: settings.linkedin
            };

            Object.keys(socialLinks).forEach(key => {
                const links = document.querySelectorAll(`a[href*="${key}.com"]`);
                links.forEach(l => l.href = socialLinks[key]);
            });
        }
    } catch (e) { console.warn('Aviso: Settings não carregadas.'); }

    // 2. Lógica Específica da Home
    if (isHomePage) {
        try {
            const homeResponse = await fetch('data/home.json');
            const homeData = await homeResponse.json();

            // Hero
            if (homeData.hero) {
                const h1 = document.querySelector('.hero-content h1');
                if (h1) {
                    h1.innerHTML = `${homeData.hero.title_prefix} <span id="dynamic-word" style="color: var(--color-primary);">${homeData.hero.words[0]}</span>`;
                    window.CMS_DYNAMIC_WORDS = homeData.hero.words;
                }
                const heroSub = document.querySelector('.hero-content p');
                if (heroSub) heroSub.textContent = homeData.hero.subheading;
                const heroImg = document.querySelector('.hero-banner');
                if (heroImg) heroImg.src = homeData.hero.image;
            }

            // Missão
            if (homeData.mission) {
                const missionP = document.querySelector('.about-grid p');
                if (missionP) missionP.textContent = homeData.mission.text;

                const bubbles = document.querySelectorAll('.float-card');
                homeData.mission.bubbles.forEach((text, i) => {
                    if (bubbles[i]) bubbles[i].textContent = text;
                });
            }
        } catch (e) { console.error('Erro na Home:', e); }
    }

    // 3. Lógica Específica do Blog (Listagem)
    if (isBlogPage && document.getElementById('blog-posts-container')) {
        try {
            // Em produção/Netlify, vamos ler uma pasta. Para o protótipo, vamos simular ou ler um index.
            // O Decap CMS cria ficheiros individuais em data/blog/.
            // NOTA: Para uma listagem real em site estático sem build step complexo, 
            // no Netlify Identity podes usar o próprio script de busca do CMS.

            // Simulação de carregamento (em produção isto seria um fetch para um index.json gerado)
            const blogContainer = document.getElementById('blog-posts-container');

            // Exemplo de como renderizar um card dinâmico:
            /*
            const renderPost = (post) => `
                <a href="posts/${post.slug}/index.html" class="card blog-card">
                    <div class="blog-card-img-wrapper">
                        <img src="${post.image}" alt="${post.title}">
                    </div>
                    <div class="blog-content">
                        <h3>${post.title}</h3>
                        <p>${post.summary}</p>
                        <span style="color: var(--color-primary); font-weight: 600;">Ler mais →</span>
                    </div>
                </a>
            `;
            */
        } catch (e) { console.error('Erro no Blog:', e); }
    }
});
