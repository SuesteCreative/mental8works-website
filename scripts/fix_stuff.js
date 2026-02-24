const fs = require('fs');
const path = require('path');

// 1. Fix About Us subheading
const aboutPath = path.join(__dirname, '..', 'about-us', 'index.html');
if (fs.existsSync(aboutPath)) {
    let content = fs.readFileSync(aboutPath, 'utf8');
    content = content.replace(/<div class="text-center" style="margin-bottom: 4rem;">\s*<h2>Os Nossos Órgãos Sociais<\/h2>\s*<p style="opacity: 0\.8; text-align: center;">[\s\S]*?<\/p>\s*<\/div>/,
        `<div class="text-center" style="margin-bottom: 4rem;">
                    <h2>Os Nossos Órgãos Sociais</h2>
                    <p style="opacity: 0.8; margin: 0 auto; max-width: 600px;">A estrutura que garante o rigor e a transparência da nossa associação.</p>
                </div>`);
    fs.writeFileSync(aboutPath, content);
    console.log('Fixed about-us subheading');
}

// 2. Fix landing page (index.html) button and email icon
const indexPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');

    // Add button
    if (!content.includes('about-us/index.html') && content.includes('profissionais que acreditavam ser possível fazer mais e melhor na área da saúde mental.')) {
        content = content.replace('profissionais que acreditavam ser possível fazer mais e melhor na área da saúde mental.</p>',
            'profissionais que acreditavam ser possível fazer mais e melhor na área da saúde mental.</p><a href="about-us/index.html" class="btn btn-secondary" style="margin-top: 1.5rem;">Saber Mais</a>');
    }

    // Fix email icon structure
    const emailSectionRegex = /<a href="mailto:mental8works@gmail.com" class="contact-method-item">[\s\S]*?<\/a>/;
    const newEmailHtml = `<a href="mailto:mental8works@gmail.com" class="contact-method-item">
                                <div class="btn-social">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                </div>
                                <span class="contact-method-text">mental8works@gmail.com</span>
                            </a>`;
    if (emailSectionRegex.test(content)) {
        content = content.replace(emailSectionRegex, newEmailHtml);
    }

    fs.writeFileSync(indexPath, content);
    console.log('Fixed index.html button and email icon');
}

// 3. Fix footer padding in CSS
const cssPath = path.join(__dirname, '..', 'assets', 'css', 'styles.css');
if (fs.existsSync(cssPath)) {
    let content = fs.readFileSync(cssPath, 'utf8');
    content = content.replace(/\.footer \{[\s\S]*?padding: [^;]*;/, '.footer {\n    background: var(--color-text-main);\n    color: white;\n    padding: 3rem 0 1.5rem;');
    fs.writeFileSync(cssPath, content);
    console.log('Fixed footer padding');
}
