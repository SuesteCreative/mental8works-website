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

// --- Build Logic ---

function buildTeamPage() {
    const teamNodes = readCollection('data/team');
    const templatePath = path.join(__dirname, '..', 'team', 'index.html');
    if (!fs.existsSync(templatePath)) return;
    let html = fs.readFileSync(templatePath, 'utf8');

    const teamItemsHtml = teamNodes.map((member, idx) => `
                <!-- ${member.name} (Dynamic) -->
                <div class="team-card-detailed reveal" style="transition-delay: ${0.05 + (idx * 0.05)}s;">
                    <div class="team-card-image">
                        <img src="${(() => { const p = member.photo || '/assets/images/fav-icon-color.png'; return p.startsWith('/') ? '..' + p : (p.startsWith('assets') ? '../' + p : p); })()}" alt="${member.name}"
                            style="object-fit: cover; width: 100%; height: 100%;">
                    </div>
                    <div class="team-card-info">
                        <h2>${member.name}</h2>
                        ${(() => {
            if (!member.linkedin || !member.linkedin.includes('linkedin.com')) return '';
            const url = member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`;
            return `
                        <a href="${url}" target="_blank" rel="noopener noreferrer" class="linkedin-icon"
                            style="color: #0077b5; margin-bottom: 0.5rem; display: inline-flex;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                fill="currentColor">
                                <path
                                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                        </a>`;
        })()}
                        <p class="role">${member.role}</p>
                        <ul class="bio-list">
                            ${(member.bio_items || []).map(item => `<li>${item}</li>`).join('\n                            ')}
                        </ul>
                    </div>
                </div>`).join('\n');

    const containerRegex = /<!-- CMS_TEAM_MEMBERS -->[\s\S]*?<!-- END_CMS_TEAM_MEMBERS -->/;
    const newContent = `<!-- CMS_TEAM_MEMBERS -->\n${teamItemsHtml}\n                    <!-- END_CMS_TEAM_MEMBERS -->`;

    if (containerRegex.test(html)) {
        html = html.replace(containerRegex, newContent);
        fs.writeFileSync(templatePath, html);
        console.log('✅ Team page cleaned and updated.');
    }
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
                        <img src="${displayImage}" alt="${post.title}" loading="lazy">
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
    const teamNodes = readCollection('data/team');
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

function buildAboutUsPage() {
    const templatePath = path.join(__dirname, '..', 'about-us', 'index.html');
    if (!fs.existsSync(templatePath)) return;
    let html = fs.readFileSync(templatePath, 'utf8');
    const teamNodes = readCollection('data/team');

    // Find key roles with exclusion to distinguish between different presidents
    const findMember = (roleKeywords, excludeKeywords = []) => {
        return teamNodes.find(m => {
            const role = (m.role || "").toLowerCase();
            const matchesAll = roleKeywords.every(k => role.includes(k.toLowerCase()));
            const matchesExclude = excludeKeywords.length === 0 || excludeKeywords.some(k => role.includes(k.toLowerCase()));
            return matchesAll && (excludeKeywords.length === 0 ? true : !excludeKeywords.some(k => role.includes(k.toLowerCase())));
        });
    };

    const presidente = findMember(['presidente'], ['assembleia', 'conselho']) || { name: 'Maria Silva' };
    const tesoureiro = findMember(['tesoureiro']) || { name: 'Alexandre Horácio' };
    const assembleia = findMember(['presidente', 'assembleia']) || { name: 'Elisa Pinto' };
    const conselho = findMember(['presid', 'conselho']) || { name: 'Pedro Neto Cunha' };

    // Update names in "Órgãos Sociais" using the same labels as the UI
    const updateRole = (roleLabel, name) => {
        const regex = new RegExp(`(<span[^>]*>${roleLabel}<\\/span><strong[^>]*>).*?(<\\/strong>)`, 'g');
        html = html.replace(regex, `$1${name}$2`);
    };

    updateRole('Presidente', presidente.name); // Direção Presidente
    updateRole('Tesoureiro', tesoureiro.name);
    // Assembleia and Conselho Fiscal also use "Presidente" label in small caps span
    // To distinguish, we look for them specifically in their cards
    const assembleiaRegex = /Assembleia Geral<\/h4>[\s\S]*?<\/div>\s*<\/div>/;
    if (assembleiaRegex.test(html)) {
        html = html.replace(assembleiaRegex, `Assembleia Geral</h4>\n                        <div style="margin-top: 1rem;">\n                            <p><span style="display: block; font-size: 0.8rem; color: var(--color-text-light); text-transform: uppercase;">Presidente</span><strong style="font-size: 1.1rem;">${assembleia.name}</strong></p>\n                        </div>\n                    </div>`);
    }

    const conselhoRegex = /Conselho Fiscal<\/h4>[\s\S]*?<\/div>\s*<\/div>/;
    if (conselhoRegex.test(html)) {
        html = html.replace(conselhoRegex, `Conselho Fiscal</h4>\n                        <div style="margin-top: 1rem;">\n                            <p><span style="display: block; font-size: 0.8rem; color: var(--color-text-light); text-transform: uppercase;">Presidente</span><strong style="font-size: 1.1rem;">${conselho.name}</strong></p>\n                        </div>\n                    </div>`);
    }

    fs.writeFileSync(templatePath, html);
    console.log('✅ About Us page updated.');
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
                        <img src="${imgSrc}" alt="${post.title}" loading="lazy">
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
    syncSettings();
    updateSitemap();
} catch (err) {
    console.error('❌ Build script error:', err);
    process.exit(1);
}
