const fs = require('fs');
const path = require('path');

// 1. Optimize CSS specifically for mobile
const cssPath = path.join(__dirname, '..', 'assets', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('/* Mobile Lighthouse Optimizations */')) {
    css += `\n/* Mobile Lighthouse Optimizations */\n@media (max-width: 768px) {\n    .blob {\n        display: none !important; /* Removes heavy GPU blur on mobile */\n    }\n}\n`;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('✅ Added mobile Lighthouse CSS overrides.');
}

function getAllHtmlFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                arrayOfFiles = getAllHtmlFiles(dirPath + '/' + file, arrayOfFiles);
            }
        } else {
            if (file.endsWith('.html')) {
                arrayOfFiles.push(path.join(dirPath, '/', file));
            }
        }
    });
    return arrayOfFiles;
}

const htmlFiles = getAllHtmlFiles(path.join(__dirname, '..'));

htmlFiles.forEach(file => {
    let html = fs.readFileSync(file, 'utf8');
    let changed = false;

    // PRELOAD hero banner in index files
    if (file.endsWith('index.html') || file.endsWith('live_index.html')) {
        // Only inject if it's the home page and not about-us etc (which use different banners, but for now we target root index)
        const isRootIndex = path.dirname(file) === path.join(__dirname, '..');

        if (isRootIndex && !html.includes('<link rel="preload" as="image" href="assets/images/hero-banner.webp"')) {
            html = html.replace('</head>', '    <!-- LCP Fix -->\n    <link rel="preload" as="image" href="assets/images/hero-banner.webp" fetchpriority="high">\n</head>');

            // Add fetchpriority to the actual img tag
            html = html.replace('class="hero-banner"', 'class="hero-banner" fetchpriority="high"');
            changed = true;
        }
    }

    // ADD EXPLICIT WIDTH/HEIGHT TO LOGOS TO PREVENT CLS
    if (html.includes('nav-logo-img')) {
        if (!html.match(/nav-logo-img[^>]*width=/)) {
            html = html.replace(/class=["']nav-logo-img["']/g, 'class="nav-logo-img" width="180" height="35"');
            changed = true;
        }
    }

    if (html.includes('footer-logo-img')) {
        if (!html.match(/footer-logo-img[^>]*width=/)) {
            html = html.replace(/class=["']footer-logo-img["']/g, 'class="footer-logo-img" width="180" height="35"');
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(file, html, 'utf8');
        console.log('✅ Applied LCP/CLS fixes to: ' + file);
    }
});
