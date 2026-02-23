const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Find the blog preview section and replace inner grid content with anchors
// Pattern: everything between the grid-cards div and the "Ver Todos" button
const blogSectionRegex = /(<!-- Blog Preview -->[\s\S]*?<div class="grid-cards"[^>]*>)[\s\S]*?(<\/div>\s*<\/div>\s*<div class="text-center">)/;

if (blogSectionRegex.test(html)) {
    html = html.replace(blogSectionRegex,
        `$1\n                <!-- CMS_BLOG_PREVIEW -->\n                <!-- END_CMS_BLOG_PREVIEW -->\n            $2`
    );
    fs.writeFileSync(indexPath, html);
    console.log('✅ Blog preview anchors injected successfully.');
} else {
    console.log('❌ Blog preview pattern not found. Checking file...');
    // Log surrounding context
    const idx = html.indexOf('Blog Preview');
    if (idx > -1) {
        console.log('Found "Blog Preview" at index', idx);
        console.log(html.substring(idx, idx + 500));
    }
}
