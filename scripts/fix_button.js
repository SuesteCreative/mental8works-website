const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');

    // Add button with regex to handle whitespace
    const aboutTextRegex = /profissionais que acreditavam ser possível fazer mais e melhor na área da saúde mental\.\s*<\/p>/;
    if (aboutTextRegex.test(content)) {
        content = content.replace(aboutTextRegex, 'profissionais que acreditavam ser possível fazer mais e melhor na área da saúde mental.</p>\n                    <a href="about-us/index.html" class="btn btn-secondary" style="margin-top: 1.5rem;">Saber Mais</a>');
        fs.writeFileSync(indexPath, content);
        console.log('✅ Button added to index.html');
    } else {
        console.log('❌ Could not find the text to add the button.');
    }
}
