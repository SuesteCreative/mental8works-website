const fs = require('fs');
const path = require('path');

// --- Helper Functions ---

function readCollection(dirPath) {
    const fullPath = path.join(__dirname, '..', dirPath);
    if (!fs.existsSync(fullPath)) return [];

    return fs.readdirSync(fullPath)
        .filter(file => file.endsWith('.json'))
        .map(file => {
            const content = JSON.parse(fs.readFileSync(path.join(fullPath, file), 'utf8'));
            content._filename = file.replace('.json', '');
            return content;
        });
}

function getAllHtmlFiles(dir, files_ = []) {
    const files = fs.readdirSync(dir);
    for (const i in files) {
        const name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            if (!name.includes('node_modules') && !name.includes('.git')) {
                getAllHtmlFiles(name, files_);
            }
        } else if (name.endsWith('.html')) {
            files_.push(name);
        }
    }
    return files_;
}

function syncFooter() {
    const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
    if (!fs.existsSync(settingsPath)) return;
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const htmlFiles = getAllHtmlFiles(path.join(__dirname, '..'));

    htmlFiles.forEach(filePath => {
        if (filePath.includes('node_modules') || filePath.includes('.git')) return;

        let content = fs.readFileSync(filePath, 'utf8');
        const relPath = path.relative(path.dirname(filePath), path.join(__dirname, '..'));
        const rootPath = relPath === '' ? './' : relPath.replace(/\\/g, '/') + '/';

        const footerHtml = `    <footer class="footer reveal">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <a href="${rootPath}" class="footer-logo-link">
                        <img src="${rootPath}assets/images/logo-mental8works-white.webp" alt="Mental8Works Associação" class="footer-logo-img">
                    </a>
                    <p style="opacity: 0.8; font-size: 0.9rem; margin-top: 1.5rem; line-height: 1.6;">
                        Promovendo a saúde mental com excelência e humanidade desde 2014. Uma associação dedicada ao seu bem-estar.
                    </p>
                </div>

                <div class="footer-col">
                    <h4 style="margin-bottom: 1.5rem; color: white; font-weight: 600; font-size: 1.1rem; border-bottom: 2px solid var(--color-primary); display: inline-block; padding-bottom: 5px;">Empresa</h4>
                    <ul style="opacity: 0.9; list-style: none; padding: 0;">
                        <li style="margin-bottom: 0.75rem;"><a href="${rootPath}">Início</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="${rootPath}sobre-nos/">Sobre Nós</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="${rootPath}equipa/">Equipa</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="${rootPath}socios/">Sócio</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h4 style="margin-bottom: 1.5rem; color: white; font-weight: 600; font-size: 1.1rem; border-bottom: 2px solid var(--color-primary); display: inline-block; padding-bottom: 5px;">Intervenção</h4>
                    <ul style="opacity: 0.9; list-style: none; padding: 0;">
                        <li style="margin-bottom: 0.75rem;"><a href="${rootPath}#servicos">Serviços</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="${rootPath}blog/">Blog</a></li>
                        <li style="margin-bottom: 0.75rem;"><a href="${rootPath}agendamentos/">Agendamentos</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h4 style="margin-bottom: 1.5rem; color: white; font-weight: 600; font-size: 1.1rem; border-bottom: 2px solid var(--color-primary); display: inline-block; padding-bottom: 5px;">Contactos</h4>
                    <ul style="opacity: 0.9; list-style: none; padding: 0; margin-bottom: 1.5rem;">
                        <li style="margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <a href="mailto:${settings.email}">${settings.email}</a>
                        </li>
                        <li style="margin-bottom: 0.75rem; line-height: 1.6; display: flex; align-items: flex-start; gap: 8px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 4px;">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span>${(() => {
                let addrHtml = '';
                if (settings.addresses) {
                    if (settings.addresses.sede && settings.addresses.sede.sede_visible) {
                        addrHtml += `<strong>Sede:</strong> ${settings.addresses.sede.sede_address}`;
                    }
                    if (settings.addresses.consultorio && settings.addresses.consultorio.consultorio_visible) {
                        if (addrHtml) addrHtml += '<br>';
                        addrHtml += `<strong>Consultório:</strong> ${settings.addresses.consultorio.consultorio_address}`;
                    }
                } else if (settings.address) {
                    addrHtml = settings.address.replace(/,\s*/g, ',<br>');
                }
                return addrHtml;
            })()}</span>
                        </li>
                    </ul>
                    <div class="footer-social-icons" style="display: flex; gap: 1rem;">
                        <a href="${settings.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        <a href="${settings.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <div class="footer-bottom-links">
                    <a href="${rootPath}privacidade/">Política de Privacidade</a>
                    <a href="${rootPath}privacidade/termos.html">Termos e Condições</a>
                    <a href="${rootPath}privacidade/">Cookies</a>
                    <a href="${rootPath}contactos/">Contactos</a>
                </div>
                <div class="footer-copyright">
                    &copy; 2026 Mental8Works &mdash; designed by <a href="https://sueste-creative.pt/" class="sueste-link" target="_blank" rel="noopener noreferrer">Sueste - Creative Agency<span class="wave-brand"><svg viewBox="0 0 60 10" preserveAspectRatio="none" style="width: 60px; height: 10px; display: inline-block; vertical-align: middle; margin-left: 4px;"><path d="M0 5 Q 7.5 0, 15 5 T 30 5 T 45 5 T 60 5" fill="none" stroke="currentColor" stroke-width="0.8"></path></svg></span></a>. Todos os direitos reservados.
                </div>
            </div>
        </div>
    </footer>`;

        const footerRegex = /<footer[\s\S]*?<\/footer>/;
        if (footerRegex.test(content)) {
            content = content.replace(footerRegex, footerHtml);
            fs.writeFileSync(filePath, content);
        }
    });
    console.log('✅ Global footers synchronized and standardized.');
}

function syncNavbar() {
    const htmlFiles = getAllHtmlFiles(path.join(__dirname, '..'));

    htmlFiles.forEach(filePath => {
        if (filePath.includes('node_modules') || filePath.includes('.git')) return;

        let content = fs.readFileSync(filePath, 'utf8');
        const relPath = path.relative(path.dirname(filePath), path.join(__dirname, '..'));
        const rootPath = relPath === '' ? './' : relPath.replace(/\\/g, '/') + '/';

        const logoPath = `${rootPath}assets/images/logo-mental8works-color.webp`;

        const navbarHtml = `    <header class="header">
        <div class="container nav-container">
            <a href="${rootPath}" class="nav-logo-link">
                <img src="${logoPath}" alt="Mental8Works - Saúde Mental em Lisboa" class="nav-logo-img">
            </a>

            <div class="mobile-toggle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </div>

            <nav class="nav-menu">
                <a href="${rootPath}#servicos" class="nav-link">Serviços</a>
                <a href="${rootPath}sobre-nos/" class="nav-link">Sobre Nós</a>
                <a href="${rootPath}equipa/" class="nav-link">Equipa</a>
                <a href="${rootPath}socios/" class="nav-link">Sócio</a>
                <a href="${rootPath}blog/" class="nav-link">Blog</a>
                <a href="${rootPath}contactos/" class="nav-link">Contactos</a>
                <a href="${rootPath}agendamentos/" class="btn btn-primary d-md-none"
                    style="margin-top: 1rem; width: 100%;">Agendar</a>
            </nav>

            <div class="nav-actions d-none d-md-block">
                <a href="${rootPath}agendamentos/" class="btn btn-primary">Agendar</a>
            </div>
        </div>
    </header>`;

        const navbarRegex = /<header[\s\S]*?<\/header>/;
        if (navbarRegex.test(content)) {
            content = content.replace(navbarRegex, navbarHtml);
            fs.writeFileSync(filePath, content);
        }
    });
    console.log('✅ Global navbars synchronized and standardized.');
}

// --- Build Logic ---

function buildTeamPage() {
    const teamNodes = readCollection('data/equipa');
    const settingsPath = path.join(__dirname, '..', 'data', 'team_settings.json');
    let isActive = true;
    if (fs.existsSync(settingsPath)) {
        try {
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            isActive = settings.active !== false;
        } catch (e) {
            console.error('Error reading team settings:', e);
        }
    }

    const templatePath = path.join(__dirname, '..', 'equipa', 'index.html');
    if (!fs.existsSync(templatePath)) return;
    let html = fs.readFileSync(templatePath, 'utf8');

    // 1. Toggles for Active vs Maintenance
    // NOTE: Forcing isActive to true if it exists in settings, but allowing override
    if (isActive) {
        // Show Active, Hide Maintenance
        html = html.replace(/id="team-active-content"(?: style="[^"]*")?/, 'id="team-active-content" style="display: block;"');
        html = html.replace(/id="team-maintenance-content"(?: style="[^"]*")?/, 'id="team-maintenance-content" style="display: none;"');

        // Clear maintenance section content
        const maintenanceContentRegex = /<!-- CMS_TEAM_MAINTENANCE_CONTENT -->[\s\S]*?<!-- END_CMS_TEAM_MAINTENANCE_CONTENT -->/;
        html = html.replace(maintenanceContentRegex, `<!-- CMS_TEAM_MAINTENANCE_CONTENT -->\n            <!-- END_CMS_TEAM_MAINTENANCE_CONTENT -->`);

        // Render Grids
        const psychiatryNodes = teamNodes.filter(m => m.specialty === 'Psiquiatria' || (m.role && (m.role.toLowerCase().includes('psiquiatria') || m.role.toLowerCase().includes('psiquiatra'))));
        const psychologyNodes = teamNodes.filter(m => !psychiatryNodes.includes(m));

        const renderGrid = (nodes) => nodes.map((member, idx) => `
                <!-- ${member.name} (Dynamic) -->
                <div class="team-card-detailed" style="transition-delay: ${0.05 + (idx * 0.05)}s;">
                    <div class="team-card-image">
                        <img src="${(() => { const p = member.photo || '/assets/images/fav-icon-color.png'; return p.startsWith('/') ? '..' + p : (p.startsWith('assets') ? '../' + p : p); })()}" alt="${member.name}"
                            width="400" height="400" style="object-fit: cover; width: 100%; height: 100%;">
                    </div>
                    <div class="team-card-info">
                        <h2>${member.name}</h2>
                        <p class="role">${member.role}</p>
                        <ul class="bio-list">
                            ${(member.bio_items || []).map(item => `<li>${item}</li>`).join('\n                            ')}
                        </ul>
                    </div>
                </div>`).join('\n');

        const containerPsychiatryRegex = /<!-- CMS_TEAM_PSYCHIATRY -->[\s\S]*?<!-- END_CMS_TEAM_PSYCHIATRY -->/;
        const containerPsychologyRegex = /<!-- CMS_TEAM_PSYCHOLOGY -->[\s\S]*?<!-- END_CMS_TEAM_PSYCHOLOGY -->/;

        if (containerPsychiatryRegex.test(html)) {
            html = html.replace(containerPsychiatryRegex, `<!-- CMS_TEAM_PSYCHIATRY -->\n${renderGrid(psychiatryNodes)}\n                            <!-- END_CMS_TEAM_PSYCHIATRY -->`);
        }
        if (containerPsychologyRegex.test(html)) {
            html = html.replace(containerPsychologyRegex, `<!-- CMS_TEAM_PSYCHOLOGY -->\n${renderGrid(psychologyNodes)}\n                            <!-- END_CMS_TEAM_PSYCHOLOGY -->`);
        }
    } else {
        // Hide Active, Show Maintenance
        html = html.replace(/id="team-active-content"(?: style="[^"]*")?/, 'id="team-active-content" style="display: none;"');
        html = html.replace(/id="team-maintenance-content"(?: style="[^"]*")?/, 'id="team-maintenance-content" style="display: block;"');

        const ucContent = `
            <div class="under-construction" style="min-height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 4rem 2rem; text-align: center;">
                <img src="../assets/images/team-construction.png" alt="Equipa em Manutenção" class="uc-visual-img" style="width: 100%; max-width: 500px; border-radius: 20px; margin-bottom: 2.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.12);">
                <h2 style="font-family: var(--font-serif); font-size: 2.5rem; color: var(--color-primary); margin-bottom: 1.5rem;">A nossa equipa está a crescer</h2>
                <p style="text-align: center; margin: 0 auto; max-width: 550px; font-size: 1.25rem; color: var(--color-text-main); line-height: 1.6;">Estamos a atualizar a nossa equipa para lhe prestar um melhor serviço. Por favor, volte mais tarde. Pedimos desculpa pelo incómodo.</p>
            </div>`;

        const maintenanceContentRegex = /<!-- CMS_TEAM_MAINTENANCE_CONTENT -->[\s\S]*?<!-- END_CMS_TEAM_MAINTENANCE_CONTENT -->/;
        html = html.replace(maintenanceContentRegex, `<!-- CMS_TEAM_MAINTENANCE_CONTENT -->\n${ucContent}\n            <!-- END_CMS_TEAM_MAINTENANCE_CONTENT -->`);
    }

    fs.writeFileSync(templatePath, html);
    console.log(`✅ Team page updated (${isActive ? 'Active' : 'Under Construction'}).`);
}

function buildBlogIndex() {
    const posts = readCollection('data/blog').sort((a, b) => new Date(b.date) - new Date(a.date));
    const templatePath = path.join(__dirname, '..', 'blog', 'index.html');
    if (!fs.existsSync(templatePath)) return;
    let html = fs.readFileSync(templatePath, 'utf8');

    const blogItemsHtml = posts.map((post, idx) => {
        const image = post.image || '/assets/images/hero-banner.webp';
        const displayImage = image.startsWith('/') ? '..' + image : (image.startsWith('assets') ? '../' + image : image);

        return `
                <!-- Artigo: ${post.title} -->
                <a href="posts/${post._filename}.html" class="card blog-card">
                    <div class="blog-card-img-wrapper">
                            <img src="${displayImage}" alt="${post.title}" width="400" height="250" loading="lazy">
                    </div>
                    <div class="blog-content">
                        <p style="font-size:0.8rem; opacity:0.6; margin-bottom:0.5rem;">${new Date(post.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <h3>${post.title}</h3>
                        <p>${post.summary || ''}</p>
                        <span style="color: var(--color-primary); font-weight: 600;">Ler mais &rarr;</span>
                    </div>
                </a>`;
    }).join('\n');

    const containerRegex = /<!-- CMS_BLOG_POSTS -->[\s\S]*?<!-- END_CMS_BLOG_POSTS -->/;
    const newContent = `<!-- CMS_BLOG_POSTS -->\n${blogItemsHtml}\n                <!-- END_CMS_BLOG_POSTS -->`;

    if (containerRegex.test(html)) {
        html = html.replace(containerRegex, newContent);
        fs.writeFileSync(templatePath, html);
        console.log('✅ Blog index cleaned and updated.');
    }

    buildIndividualPosts(posts);
}

function buildIndividualPosts(posts) {
    const templatePath = path.join(__dirname, '..', 'blog', 'posts', 'template.html');
    if (!fs.existsSync(templatePath)) {
        console.warn('⚠️ Blog post template not found.');
        return;
    }
    const template = fs.readFileSync(templatePath, 'utf8');
    const teamNodes = readCollection('data/equipa');
    const authorNodes = readCollection('data/authors');

    posts.forEach(post => {
        let html = template;

        // Find Author in Authors collection or Team collection
        const authorName = post.author || "Equipa Mental8Works";
        let authorRole = "Especialista Mental8Works";
        let authorPhoto = "/assets/images/fav-icon-color.png";

        // Check Authors first (CMS blog relation points here)
        let authorMatch = authorNodes.find(m => m.name && m.name.toLowerCase() === authorName.toLowerCase());

        // Fallback to Team if not found in Authors
        if (!authorMatch) {
            authorMatch = teamNodes.find(m => m.name && m.name.toLowerCase() === authorName.toLowerCase());
        }

        if (authorMatch) {
            authorRole = authorMatch.role || authorRole;
            if (authorMatch.photo) {
                authorPhoto = authorMatch.photo;
            }
        }

        const dateFormatted = new Date(post.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });

        // Simple replacements
        html = html.replace(/{{TITLE}}/g, post.title || "Sem Título");
        html = html.replace(/{{DATE}}/g, dateFormatted);
        html = html.replace(/{{SUMMARY}}/g, post.summary || "");
        html = html.replace(/{{AUTHOR_NAME}}/g, authorName);
        html = html.replace(/{{AUTHOR_ROLE}}/g, authorRole);

        // Author Photo Path (ensure it's relative to /blog/posts/)
        const authorImgRelative = authorPhoto.startsWith('/') ? '../..' + authorPhoto : (authorPhoto.startsWith('assets') ? '../../' + authorPhoto : authorPhoto);
        html = html.replace(/{{AUTHOR_IMAGE}}/g, authorImgRelative);

        // Author Bio
        const authorBio = (authorMatch && authorMatch.bio) ? authorMatch.bio : '';
        html = html.replace(/{{AUTHOR_BIO}}/g, authorBio);

        // Author LinkedIn
        const authorLinkedin = (authorMatch && authorMatch.linkedin) ? authorMatch.linkedin : '';
        const authorLinkedinHtml = authorLinkedin
            ? `<a href="${authorLinkedin}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:6px; margin-top:0.5rem; font-size:0.85rem; color:#0077b5; text-decoration:none; font-weight:500;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>LinkedIn</a>`
            : '';
        html = html.replace(/{{AUTHOR_LINKEDIN}}/g, authorLinkedinHtml);

        // Body - full markdown parser
        let bodyParsed = (post.body || "");

        // Handle markdown links [text](url)
        bodyParsed = bodyParsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); font-weight: 500; text-decoration: underline;">$1</a>');

        // Handle markdown headings ### h3, ## h2
        bodyParsed = bodyParsed.replace(/^### (.+)$/gm, '<h3 style="margin-top: 2rem; margin-bottom: 0.75rem;">$1</h3>');
        bodyParsed = bodyParsed.replace(/^## (.+)$/gm, '<h2 style="margin-top: 2.5rem; margin-bottom: 1rem;">$1</h2>');

        // Handle bold **text**
        bodyParsed = bodyParsed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Handle newlines (double newline = paragraph break, single = line break)
        const bodyWithNewlines = bodyParsed.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
        const canonicalUrl = `https://mental8works.pt/blog/posts/${post._filename}.html`;
        html = html.replace(/{{CANONICAL}}/g, canonicalUrl);
        html = html.replace(/{{BODY}}/g, bodyWithNewlines);

        // Hero Image
        const image = post.image || '/assets/images/hero-banner.webp';
        const imgPath = image.startsWith('/') ? '../..' + image : (image.startsWith('assets') ? '../../' + image : image);
        html = html.replace(/{{IMAGE}}/g, imgPath);

        const targetFile = path.join(__dirname, '..', 'blog', 'posts', `${post._filename}.html`);
        fs.writeFileSync(targetFile, html);
    });
    console.log(`✅ Generated ${posts.length} individual blog posts.`);
}

function buildHomePage() {
    const homeDataPath = path.join(__dirname, '..', 'data', 'home.json');
    if (!fs.existsSync(homeDataPath)) return;
    const home = JSON.parse(fs.readFileSync(homeDataPath, 'utf8'));
    const templatePath = path.join(__dirname, '..', 'index.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Update Hero
    if (home.hero) {
        if (home.hero.title_prefix) {
            // Robust: replace everything inside h1 before the <br>
            html = html.replace(/(<h1>[^<]*?)(<br>)/, `<h1>${home.hero.title_prefix}$2`);
        }
        if (home.hero.words) {
            const wordsArray = JSON.stringify(home.hero.words);
            html = html.replace(/window\.CMS_DYNAMIC_WORDS\s*=\s*\[.*?\]/, `window.CMS_DYNAMIC_WORDS = ${wordsArray}`);
        }
        if (home.hero.subheading) {
            html = html.replace(/(<p>)([\s\S]*?)(<\/p>[\s\S]*?<div class="hero-actions">)/, `$1\n                    ${home.hero.subheading}\n                $3`);
        }
        if (home.hero.image) {
            const heroImgPath = home.hero.image.startsWith('/') ? '.' + home.hero.image : home.hero.image;
            html = html.replace(/(<img[^>]*class="hero-banner"[^>]*src=")[^"]*(")/, `$1${heroImgPath}$2`);
        }
    }

    // Update Services
    if (home.services) {
        const servicesHtml = home.services.map((s, idx) => {
            const icon = idx === 1 ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>` :
                (idx === 2 ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>` :
                    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>`);

            const btn = idx === 2 ? `<a href="socios/index.html" class="btn btn-secondary" style="width: 100%; text-align: center;">Donativo</a>` :
                `<a href="agendamentos/index.html" class="btn btn-primary" style="width: 100%; text-align: center;">Agendar</a>`;

            return `
                <div class="card reveal">
                    <div class="card-content">
                        <div class="service-icon-wrapper">
                            ${icon}
                        </div>
                        <h3>${s.name}</h3>
                        <div style="width: 50px; height: 3px; background: ${idx === 1 ? '#03919f' : '#f0be44'}; margin-bottom: 1rem;"></div>
                        <p>${s.description}</p>
                    </div>
                    <div style="margin-top: 1rem;">
                        ${btn}
                    </div>
                </div>`;
        }).join('\n');

        const servicesRegex = /<!-- CMS_SERVICES -->[\s\S]*?<!-- END_CMS_SERVICES -->/;
        if (servicesRegex.test(html)) {
            html = html.replace(servicesRegex, `<!-- CMS_SERVICES -->\n${servicesHtml}\n                <!-- END_CMS_SERVICES -->`);
        }
    }

    // Update Mission
    if (home.mission && home.mission.text) {
        html = html.replace(/(<h2 style="margin-top: 1rem;">O que Nos Define<\/h2>[\s\S]*?<p>)([\s\S]*?)(<\/p>)/, `$1${home.mission.text}$3`);

        if (home.mission.bubbles) {
            const bubblesHtml = home.mission.bubbles.map(b => `<div class="mission-bubble">${b}</div>`).join('\n                        ');
            const bubbleContainerRegex = /<div class="mission-bubbles">[\s\S]*?<\/div>/;
            html = html.replace(bubbleContainerRegex, `<div class="mission-bubbles">\n                        ${bubblesHtml}\n                    </div>`);
        }
    }

    fs.writeFileSync(templatePath, html);
    console.log('✅ Homepage updated.');
}

// --- Markdown Helper ---
function markdownToHtml(text) {
    if (!text) return "";
    let html = text;
    // Bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    // Newlines
    html = html.replace(/\n/g, '<br>');
    return html;
}

function buildAboutUsPage() {
    const templatePath = path.join(__dirname, '..', 'sobre-nos', 'index.html');
    if (!fs.existsSync(templatePath)) return;
    let html = fs.readFileSync(templatePath, 'utf8');

    // CMS Content
    const dataPath = path.join(__dirname, '..', 'data', 'about.json');
    if (fs.existsSync(dataPath)) {
        const about = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // Hero
        if (about.hero) {
            const heroHtml = `
            <div class="text-center" style="margin-bottom: 4rem;">
                <span class="badge" style="background: var(--color-primary); color: white;">Nossa História</span>
                <h1 style="margin-top: 1rem;">${about.hero.title}</h1>
                <p class="lead" style="max-width: 800px; margin: 1.5rem auto; font-size: 1.25rem; opacity: 0.9;">
                    ${about.hero.lead}
                </p>
            </div>`;
            const heroRegex = /<!-- CMS_ABOUT_HERO -->[\s\S]*?<!-- END_CMS_ABOUT_HERO -->/;
            if (heroRegex.test(html)) {
                html = html.replace(heroRegex, `<!-- CMS_ABOUT_HERO -->${heroHtml}\n            <!-- END_CMS_ABOUT_HERO -->`);
            }
        }

        // History
        if (about.history) {
            const histHtml = `
                <div class="reveal">
                    <h2>${about.history.title}</h2>
                    <p style="font-size: 1.1rem; line-height: 1.8; margin-top: 1.5rem;">
                        ${about.history.text1}
                    </p>
                    <p style="font-size: 1.1rem; line-height: 1.8; margin-top: 1rem;">
                        ${about.history.text2}
                    </p>
                    <p style="font-size: 1.1rem; line-height: 1.8; margin-top: 1rem;">
                        ${about.history.text3}
                    </p>
                </div>`;
            const histRegex = /<!-- CMS_ABOUT_HISTORY -->[\s\S]*?<!-- END_CMS_ABOUT_HISTORY -->/;
            if (histRegex.test(html)) {
                html = html.replace(histRegex, `<!-- CMS_ABOUT_HISTORY -->${histHtml}\n                <!-- END_CMS_ABOUT_HISTORY -->`);
            }
        }

        // Social
        if (about.social_component) {
            const socialHtml = `
                <div class="reveal">
                    <h2>${about.social_component.title}</h2>
                    <p style="font-size: 1.1rem; line-height: 1.8; margin-top: 1.5rem;">
                        ${about.social_component.text}
                    </p>
                    <div class="neat-graph"
                        style="margin-top: 2rem; background: white; padding: 3rem 2rem 3.5rem 3rem; border-radius: 20px; box-shadow: var(--shadow-md); position: relative; overflow: visible;">
                        <p
                            style="font-size: 0.75rem; color: var(--color-text-light); margin-bottom: 1rem; text-align: left;">
                            Nº de Consultas</p>
                        <div
                            style="display: flex; justify-content: space-around; align-items: flex-end; height: 180px; gap: 15px; border-left: 2px solid #eee; border-bottom: 2px solid #eee; padding-left: 10px; padding-bottom: 0; margin-bottom: 2rem;">
                            <div
                                style="width: 60px; height: 40%; background: var(--color-primary-light); border-radius: 8px 8px 0 0; position: relative; display: flex; justify-content: center;">
                                <span
                                    style="position: absolute; top: -22px; font-weight: 700; color: var(--color-text-main); font-size: 0.8rem;">1200+</span>
                                <span
                                    style="position: absolute; bottom: -22px; color: var(--color-text-light); font-size: 0.75rem;">2014</span>
                            </div>
                            <div
                                style="width: 60px; height: 65%; background: var(--color-primary); border-radius: 8px 8px 0 0; position: relative; display: flex; justify-content: center;">
                                <span
                                    style="position: absolute; top: -22px; font-weight: 700; color: var(--color-text-main); font-size: 0.8rem;">3500+</span>
                                <span
                                    style="position: absolute; bottom: -22px; color: var(--color-text-light); font-size: 0.75rem;">2019</span>
                            </div>
                            <div
                                style="width: 60px; height: 95%; background: var(--color-secondary); border-radius: 8px 8px 0 0; position: relative; display: flex; justify-content: center;">
                                <span
                                    style="position: absolute; top: -22px; font-weight: 700; color: var(--color-text-main); font-size: 0.8rem;">5000+</span>
                                <span
                                    style="position: absolute; bottom: -22px; color: var(--color-text-light); font-size: 0.75rem;">2026</span>
                            </div>
                        </div>
                        <p class="text-center"
                            style="font-size: 0.9rem; color: var(--color-text-main); font-weight: 500;">
                            Evolução do Impacto Social (Consultas Realizadas)
                        </p>
                    </div>
                </div>`;
            const socialRegex = /<!-- CMS_ABOUT_SOCIAL -->[\s\S]*?<!-- END_CMS_ABOUT_SOCIAL -->/;
            if (socialRegex.test(html)) {
                html = html.replace(socialRegex, `<!-- CMS_ABOUT_SOCIAL -->${socialHtml}\n                <!-- END_CMS_ABOUT_SOCIAL -->`);
            }
        }

        // Image
        if (about.image) {
            const imgHtml = `
                    <!-- CMS_ABOUT_IMAGE -->
                    <img src="${about.image.startsWith('/') ? '..' + about.image : about.image}" alt="Fotografia da equipa de psicólogos e psiquiatras da Mental8Works em Lisboa"
                        style="width: 100%; border-radius: 20px; box-shadow: var(--shadow-lg);">
                    <!-- END_CMS_ABOUT_IMAGE -->`;
            const imgRegex = /<!-- CMS_ABOUT_IMAGE -->[\s\S]*?<!-- END_CMS_ABOUT_IMAGE -->/;
            if (imgRegex.test(html)) {
                html = html.replace(imgRegex, imgHtml);
            }
        }

        // Orgaos Sociais (render from about.json)
        if (about.orgaos_sociais) {
            const orgaosHtml = about.orgaos_sociais.map(org => {
                const membersHtml = org.members.map((m, idx) => `
                        <p style="${idx < org.members.length - 1 ? 'margin-bottom: 1rem;' : ''}">
                            <span style="display: block; font-size: 0.8rem; color: var(--color-text-light); text-transform: uppercase;">${m.label}</span>
                            <strong style="font-size: 1.1rem;">${m.name}</strong>
                        </p>
                        ${idx < org.members.length - 1 ? '<hr style="margin: 1rem auto; width: 30px; opacity: 0.1;">' : ''}
                `).join('');

                return `
                <div class="card reveal text-center" style="padding: 2.5rem; border-top: 4px solid ${org.accent_color || 'var(--color-primary)'};">
                    <h4 style="color: var(--color-primary); margin-bottom: 1.5rem; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">
                        ${org.title}
                    </h4>
                    <div style="margin-top: 1rem;">
                        ${membersHtml}
                    </div>
                </div>`;
            }).join('\n');

            const orgaosRegex = /<!-- CMS_ABOUT_ORGAOS -->[\s\S]*?<!-- END_CMS_ABOUT_ORGAOS -->/;
            if (orgaosRegex.test(html)) {
                html = html.replace(orgaosRegex, `<!-- CMS_ABOUT_ORGAOS -->${orgaosHtml}\n                <!-- END_CMS_ABOUT_ORGAOS -->`);
            }
        }
    }

    fs.writeFileSync(templatePath, html);
    console.log('✅ About Us page updated.');
}

function buildSociosPage() {
    const templatePath = path.join(__dirname, '..', 'socios', 'index.html');
    if (!fs.existsSync(templatePath)) return;
    let html = fs.readFileSync(templatePath, 'utf8');

    const dataPath = path.join(__dirname, '..', 'data', 'socios.json');
    if (!fs.existsSync(dataPath)) return;
    const socios = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Hero
    if (socios.hero) {
        const heroHtml = `
            <div class="text-center" style="margin-bottom: 4rem;">
                <span class="badge" style="background: var(--color-secondary); color: var(--color-text-main);">Missão Social</span>
                <h1 style="margin-top: 1rem;">${socios.hero.title}</h1>
                <p class="lead" style="max-width: 800px; margin: 1.5rem auto; font-size: 1.25rem; opacity: 0.9;">
                    ${socios.hero.lead}
                </p>
            </div>`;
        html = html.replace(/<!-- CMS_SOCIOS_HERO -->[\s\S]*?<!-- END_CMS_SOCIOS_HERO -->/, `<!-- CMS_SOCIOS_HERO -->${heroHtml}\n            <!-- END_CMS_SOCIOS_HERO -->`);
    }

    // Impacto
    if (socios.impact) {
        const impactHtml = `
            <div style="max-width: 960px; margin: 0 auto; margin-bottom: 6rem; display: flex; flex-direction: column; align-items: center;"
                class="reveal">
                <h2 style="text-align: center; width: 100%;">${socios.impact.title}</h2>
                <p
                    style="font-size: 1.15rem; line-height: 1.8; margin-top: 1.5rem; text-align: center; max-width: 900px; margin-inline: auto; color: var(--color-text-main); opacity: 0.9;">
                    ${socios.impact.text1}
                </p>
                <p
                    style="font-size: 1.15rem; line-height: 1.8; margin-top: 1.2rem; text-align: center; max-width: 900px; margin-inline: auto; color: var(--color-text-main); opacity: 0.9;">
                    ${markdownToHtml(socios.impact.text2)}
                </p>
                <div style="margin-top: 2rem;">
                    <a href="../contactos/index.html" class="btn btn-primary">Quero Ser Sócio</a>
                </div>
            </div>`;
        html = html.replace(/<!-- CMS_SOCIOS_IMPACT -->[\s\S]*?<!-- END_CMS_SOCIOS_IMPACT -->/, `<!-- CMS_SOCIOS_IMPACT -->${impactHtml}\n            <!-- END_CMS_SOCIOS_IMPACT -->`);
    }

    // IBAN
    if (socios.iban) {
        const ibanHtml = `
            <div class="card text-center reveal"
                style="margin: 4rem auto 0 auto; max-width: 960px; width: 100%; padding: 2.5rem; background: #ffffff; border: 1.5px solid rgba(3,145,159,0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                <span class="badge"
                    style="background: var(--color-primary); color: white; margin-bottom: 1rem;">Donativos</span>
                <h3 style="margin-top: 0.75rem; font-family: var(--font-serif); color: var(--color-text-main);">Apoie a
                    Nossa Missão</h3>
                <p style="max-width: 600px; margin: 1rem auto; font-size: 1rem;">
                    Pode também contribuir directamente para a nossa missão através de transferência bancária.
                </p>
                <div
                    style="display: inline-flex; align-items: center; gap: 0.75rem; background: #f8fafc; border: 1.5px solid rgba(3,145,159,0.2); border-radius: 14px; padding: 1rem 2rem; margin-top: 0.5rem; box-shadow: 0 4px 16px rgba(3,145,159,0.08);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span
                        style="font-family: 'Outfit', monospace; font-size: 1.05rem; font-weight: 600; letter-spacing: 0.05em; color: var(--color-text-main);">${socios.iban}</span>
                </div>
                <p style="font-size: 0.85rem; opacity: 0.6; margin-top: 1rem;">Mental8Works — IBAN para donativos</p>
            </div>`;
        html = html.replace(/<!-- CMS_SOCIOS_DONATIVOS -->[\s\S]*?<!-- END_CMS_SOCIOS_DONATIVOS -->/, `<!-- CMS_SOCIOS_DONATIVOS -->${ibanHtml}\n            <!-- END_CMS_SOCIOS_DONATIVOS -->`);
    }

    fs.writeFileSync(templatePath, html);
    console.log('✅ Socios page updated.');
}

function buildAppointmentsPage() {
    const templatePath = path.join(__dirname, '..', 'agendamentos', 'index.html');
    if (!fs.existsSync(templatePath)) return;
    let html = fs.readFileSync(templatePath, 'utf8');

    const dataPath = path.join(__dirname, '..', 'data', 'appointments.json');
    if (!fs.existsSync(dataPath)) return;
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Hero Subtitle
    if (data.hero_subtitle) {
        const heroHtml = `
            <div class="text-center">
                <h1>Agende a Sua Consulta</h1>
                <p class="lead" style="max-width: 800px; margin: 1.5rem auto 4rem;">
                    ${data.hero_subtitle}
                </p>
            </div>`;
        html = html.replace(/<!-- CMS_APPOINTMENTS_HERO -->[\s\S]*?<!-- END_CMS_APPOINTMENTS_HERO -->/, `<!-- CMS_APPOINTMENTS_HERO -->${heroHtml}\n            <!-- END_CMS_APPOINTMENTS_HERO -->`);
    }

    // Psychiatry Pricing
    if (data.psychiatry) {
        const psychHtml = `
                <!-- CMS_PRICING_PSYCHIATRY -->
                <div class="pricing-card reveal">
                    <div class="pricing-header">
                        <h3>Psiquiatria</h3>
                        <div class="price-main">${data.psychiatry.first}<span> / 1ª Consulta</span></div>
                        <div class="price-next">Seguintes: ${data.psychiatry.following}</div>
                        <div class="price-social"
                            style="color: var(--color-primary); font-weight: 600; margin-top: 0.5rem;">Preço social: ${data.psychiatry.social}
                        </div>
                    </div>
                    <ul class="pricing-features">
                        <li>Atendimento Online e Presencial</li>
                    </ul>
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLScmf8ICKVDhN5RiBjPreF12jviu3av3TLlvrorxlu9lP9VSSA/viewform?usp=pp_url"
                        target="_blank" rel="noopener noreferrer" class="btn btn-primary"
                        style="width: 100%; border-radius: 50px;">Marcar
                        Consulta</a>
                </div>
                <!-- END_CMS_PRICING_PSYCHIATRY -->`;
        html = html.replace(/<!-- CMS_PRICING_PSYCHIATRY -->[\s\S]*?<!-- END_CMS_PRICING_PSYCHIATRY -->/, psychHtml);
    }

    // Psychology Pricing
    if (data.psychology) {
        const psychHtml = `
                <!-- CMS_PRICING_PSYCHOLOGY -->
                <div class="pricing-card reveal featured">
                    <div class="pricing-header">
                        <h3>Psicologia</h3>
                        <div class="price-main">${data.psychology.first}<span> / 1ª Consulta</span></div>
                        <div class="price-next">Seguintes: ${data.psychology.following}</div>
                        <div class="price-social"
                            style="color: var(--color-primary); font-weight: 600; margin-top: 0.5rem;">Preço social: ${data.psychology.social}
                        </div>
                    </div>
                    <ul class="pricing-features">
                        <li>Atendimento Online e Presencial</li>
                    </ul>
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSfwd4SGi8fKlZjJW7xDwzFOYjrITs4AE_vcAxs2_PDKjgff5A/viewform?usp=pp_url"
                        target="_blank" rel="noopener noreferrer" class="btn btn-primary"
                        style="width: 100%; border-radius: 50px;">Marcar
                        Consulta</a>
                </div>
                <!-- END_CMS_PRICING_PSYCHOLOGY -->`;
        html = html.replace(/<!-- CMS_PRICING_PSYCHOLOGY -->[\s\S]*?<!-- END_CMS_PRICING_PSYCHOLOGY -->/, psychHtml);
    }

    // Social Info Box
    // Build FAQS logic snippet

    if (data.faqs) {
        let faqsHtml = '<!-- CMS_APPOINTMENTS_FAQS -->\n            <div class="faq-container">\n';
        data.faqs.forEach(f => {
            const mdAnswer = f.faq.answer
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>');

            faqsHtml += `                <div class="faq-item">
                    <button class="faq-question">
                        ${f.faq.question}
                        <svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div class="faq-answer">
                        <p>${mdAnswer}</p>
                    </div>
                </div>\n`;
        });
        faqsHtml += '            </div>\n            <!-- END_CMS_APPOINTMENTS_FAQS -->';

        html = html.replace(/<!-- CMS_APPOINTMENTS_FAQS -->[\s\S]*?<!-- END_CMS_APPOINTMENTS_FAQS -->/, faqsHtml);
    }

    if (data.social_info) {
        const socialHtml = `
            <!-- CMS_APPOINTMENTS_SOCIAL_INFO -->
            <div class="social-value-box reveal" style="margin-top: 4rem;">
                <div class="social-value-content">
                    <div>
                        <h4
                            style="color: var(--color-primary); margin-bottom: 1rem; font-family: var(--font-serif); font-size: 1.5rem;">
                            ${data.social_info.title}</h4>
                        <p
                            style="margin-bottom: 1rem; color: var(--color-text-main); font-size: 1.1rem; line-height: 1.8;">
                            ${data.social_info.text1}
                        </p>
                        <p
                            style="margin-bottom: 1rem; color: var(--color-text-main); font-size: 1.1rem; line-height: 1.8;">
                            ${data.social_info.text2}
                        </p>
                        <hr style="opacity: 0.1; margin: 2rem 0;">
                        <p style="font-weight: 600;">Contacte-nos para esclarecer alguma dúvida que persista.</p>
                        <p>Email: <a href="mailto:mental8works@gmail.com"
                                style="color: var(--color-primary);">mental8works@gmail.com</a></p>
                    </div>
                </div>
            </div>
            <!-- END_CMS_APPOINTMENTS_SOCIAL_INFO -->`;
        html = html.replace(/<!-- CMS_APPOINTMENTS_SOCIAL_INFO -->[\s\S]*?<!-- END_CMS_APPOINTMENTS_SOCIAL_INFO -->/, socialHtml);
    }

    fs.writeFileSync(templatePath, html);
    console.log('✅ Appointments page updated.');
}

function syncSettings() {
    const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
    if (!fs.existsSync(settingsPath)) return;
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

    const htmlFiles = getAllHtmlFiles(path.join(__dirname, '..'));

    htmlFiles.forEach(filePath => {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        // Sync Email
        if (settings.email) {
            const emailRegex = /href="mailto:[^"]*"/g;
            const emailTextRegex = />[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}</g;
            if (content.match(emailRegex)) {
                content = content.replace(emailRegex, `href="mailto:${settings.email}"`);
                changed = true;
            }
            if (content.match(emailTextRegex)) {
                content = content.replace(emailTextRegex, `>${settings.email}<`);
                changed = true;
            }
        }

        // Sync Phone
        if (settings.phone) {
            const phoneHrefRegex = /href="tel:[^"]*"/g;
            const phoneTextRegex = /(>)(\+?\d[\d\s\-().]{6,}\d)(<)/g;
            if (content.match(phoneHrefRegex)) {
                content = content.replace(phoneHrefRegex, `href="tel:${settings.phone.replace(/\s/g, '')}"`);
                changed = true;
            }
            if (content.match(phoneTextRegex)) {
                content = content.replace(phoneTextRegex, `$1${settings.phone}$3`);
                changed = true;
            }
        }

        // Sync Socials
        if (settings.facebook) {
            content = content.replace(/href="https:\/\/www\.facebook\.com\/[^"]*"/g, `href="${settings.facebook}"`);
            changed = true;
        }
        if (settings.instagram) {
            content = content.replace(/href="https:\/\/www\.instagram\.com\/[^"]*"/g, `href="${settings.instagram}"`);
            changed = true;
        }
        if (settings.linkedin) {
            content = content.replace(/href="https:\/\/www\.linkedin\.com\/company\/[^"]*"/g, `href="${settings.linkedin}"`);
            changed = true;
        }

        // Sync Address
        if (settings.address) {
            const formattedAddress = settings.address.replace(/,\s*/g, ',<br>');

            // 1. Footer / Contact Page blocks (span/div based)
            const addressBlockRegex = /(?:Av\.|Avenida|Rua|Praceta|Largo)[\s\S]{5,100}\d{4}-\d{3}[\s\S]{1,50}Lisboa/gi;
            if (content.match(addressBlockRegex)) {
                content = content.replace(addressBlockRegex, formattedAddress);
                changed = true;
            }

            // 2. SEO Meta Description Address
            const metaAddressRegex = /Estamos em Lisboa,.*?\d{4}-\d{3} Lisboa/gi;
            if (content.match(metaAddressRegex)) {
                content = content.replace(metaAddressRegex, `Estamos em Lisboa, ${settings.address}`);
                changed = true;
            }

            // 3. JSON-LD Address
            const streetAddressRegex = /"streetAddress":\s*"[^"]*"/g;
            const postalCodeRegex = /"postalCode":\s*"[^"]*"/g;

            const streetMatch = settings.address.match(/^[^,]+/);
            const zipMatch = settings.address.match(/\d{4}-\d{3}/);

            if (streetMatch && content.match(streetAddressRegex)) {
                content = content.replace(streetAddressRegex, `"streetAddress": "${streetMatch[0]}"`);
                changed = true;
            }
            if (zipMatch && content.match(postalCodeRegex)) {
                content = content.replace(postalCodeRegex, `"postalCode": "${zipMatch[0]}"`);
                changed = true;
            }
        }

        // Sync Telephone in JSON-LD
        if (settings.phone) {
            const schemaPhoneRegex = /"telephone":\s*"[^"]*"/g;
            if (content.match(schemaPhoneRegex)) {
                content = content.replace(schemaPhoneRegex, `"telephone": "${settings.phone}"`);
                changed = true;
            }
        }

        if (changed) {
            fs.writeFileSync(filePath, content);
        }
    });
    console.log('✅ Global settings synchronized.');
}

function updateSitemap() {
    const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) return;

    const blogPosts = readCollection('data/blog').filter(p => p.title && p.title.trim() !== '' && p._filename !== 'odeio-segundas');
    const today = new Date().toISOString().split('T')[0];

    let sitemap = fs.readFileSync(sitemapPath, 'utf8');

    // Extract base sitemap (everything before the last </urlset>)
    const urlsetEnd = sitemap.lastIndexOf('</urlset>');
    if (urlsetEnd === -1) return;

    let newSitemap = sitemap.substring(0, urlsetEnd);

    blogPosts.forEach(post => {
        const url = `https://mental8works.pt/blog/posts/${post._filename}.html`;
        if (!newSitemap.includes(url)) {
            newSitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
        }
    });

    newSitemap += '\n</urlset>';
    fs.writeFileSync(sitemapPath, newSitemap);
    console.log('✅ Sitemap updated with blog posts.');
}



function buildBlogPreview() {
    // Injects top 3 most recent posts into the homepage blog preview section
    const posts = readCollection('data/blog')
        .filter(p => p.title && p.title.trim() !== '' && p._filename !== 'odeio-segundas')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    const templatePath = path.join(__dirname, '..', 'index.html');
    if (!fs.existsSync(templatePath)) return;
    let html = fs.readFileSync(templatePath, 'utf8');

    const previewHtml = posts.map(post => {
        const image = post.image || '/assets/images/hero-banner.webp';
        const imgSrc = image.startsWith('/') ? '.' + image : image;
        const summary = (post.summary || '').substring(0, 120) + (post.summary && post.summary.length > 120 ? '...' : '');
        const date = new Date(post.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
        return `
                <a href="blog/posts/${post._filename}.html" class="card blog-card reveal" style="text-decoration:none; color:inherit; display:flex; flex-direction:column;">
                    <div class="blog-card-img-wrapper">
                            <img src="${imgSrc}" alt="${post.title}" width="400" height="250" loading="lazy">
                    </div>
                    <div class="blog-content">
                        <p style="font-size:0.8rem; opacity:0.6; margin-bottom:0.5rem;">${date}</p>
                        <h3>${post.title}</h3>
                        <p>${summary}</p>
                        <span style="color: var(--color-primary); font-weight: 600;">Ler mais &rarr;</span>
                    </div>
                </a>`;
    }).join('\n');

    const previewRegex = /<!-- CMS_BLOG_PREVIEW -->[\s\S]*?<!-- END_CMS_BLOG_PREVIEW -->/;
    if (previewRegex.test(html)) {
        html = html.replace(previewRegex, `<!-- CMS_BLOG_PREVIEW -->${previewHtml}\n                <!-- END_CMS_BLOG_PREVIEW -->`);
        fs.writeFileSync(templatePath, html);
        console.log('✅ Homepage blog preview updated.');
    } else {
        console.warn('⚠️  CMS_BLOG_PREVIEW anchor not found in index.html — skipping preview update.');
    }
}

// Run
try {
    buildTeamPage();
    buildBlogIndex();
    buildHomePage();
    buildBlogPreview();
    buildAboutUsPage();
    buildSociosPage();
    buildAppointmentsPage();
    syncSettings();
    syncFooter();
    syncNavbar();
    updateSitemap();
} catch (err) {
    console.error('❌ Build script error:', err);
    process.exit(1);
}

