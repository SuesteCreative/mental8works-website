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
                        <img src="${member.photo.startsWith('/') ? '..' + member.photo : (member.photo.startsWith('assets') ? '../' + member.photo : member.photo)}" alt="${member.name}"
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

    posts.forEach(post => {
        let html = template;

        // Map Author Role if it matches someone in the team
        const authorName = post.author || "Equipa Mental8Works";
        let authorRole = "Especialista Mental8Works";

        const authorMatch = teamNodes.find(m => m.name && m.name.toLowerCase() === authorName.toLowerCase());
        if (authorMatch) {
            authorRole = authorMatch.role;
        }

        const dateFormatted = new Date(post.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });

        // Simple replacements
        html = html.replace(/{{TITLE}}/g, post.title || "Sem Título");
        html = html.replace(/{{DATE}}/g, dateFormatted);
        html = html.replace(/{{SUMMARY}}/g, post.summary || "");
        html = html.replace(/{{AUTHOR_NAME}}/g, authorName);
        html = html.replace(/{{AUTHOR_ROLE}}/g, authorRole);

        // Body (handling newlines)
        const bodyWithNewlines = (post.body || "").replace(/\n/g, '<br>');
        html = html.replace(/{{BODY}}/g, bodyWithNewlines);

        // Images - Template uses ../../../assets but individual post at blog/posts/slug.html needs ../../assets
        // Wait, template I wrote uses ../../../assets assuming blog/posts/slug/index.html.
        // Let me adjust paths to ../../assets for blog/posts/slug.html
        html = html.replace(/\.\.\/\.\.\/\.\.\/assets/g, '../../assets');
        html = html.replace(/\.\.\/\.\.\/index\.html/g, '../index.html'); // Back to blog index
        html = html.replace(/\.\.\/\.\.\/\.\.\/index\.html/g, '../../index.html'); // Back to home

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
            html = html.replace(/(<h1>)([^<]*)(<br>)/, `$1${home.hero.title_prefix}$3`);
        }
        if (home.hero.words) {
            const wordsArray = JSON.stringify(home.hero.words);
            html = html.replace(/window\.CMS_DYNAMIC_WORDS\s*=\s*\[.*?\]/, `window.CMS_DYNAMIC_WORDS = ${wordsArray}`);
        }
        if (home.hero.subheading) {
            html = html.replace(/(<p>)([\s\S]*?)(<\/p>[\s\S]*?<div class="hero-actions">)/, `$1\n                    ${home.hero.subheading}\n                $3`);
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
            const emailRegex = /href="mailto:.*?"/g;
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

        // Sync Socials
        if (settings.facebook) {
            content = content.replace(/href="https:\/\/www\.facebook\.com\/.*?"/g, `href="${settings.facebook}"`);
            changed = true;
        }
        if (settings.instagram) {
            content = content.replace(/href="https:\/\/www\.instagram\.com\/.*?"/g, `href="${settings.instagram}"`);
            changed = true;
        }
        if (settings.linkedin) {
            content = content.replace(/href="https:\/\/www\.linkedin\.com\/company\/.*?"/g, `href="${settings.linkedin}"`);
            changed = true;
        }

        // Sync Address in Footer (approximate match)
        if (settings.address) {
            const addressMatch = content.match(/<span[^>]*>Av\. Miguel Bombarda,[\s\S]*?1050-164 Lisboa<\/span>/);
            if (addressMatch) {
                const formattedAddress = settings.address.replace(/, /g, ',<br>');
                content = content.replace(addressMatch[0], `<span>${formattedAddress}</span>`);
                changed = true;
            }
        }

        if (changed) {
            fs.writeFileSync(filePath, content);
        }
    });
    console.log('✅ Global settings synchronized.');
}

// Run
try {
    buildTeamPage();
    buildBlogIndex();
    buildHomePage();
    syncSettings();
} catch (err) {
    console.error('❌ Build script error:', err);
    process.exit(1);
}
