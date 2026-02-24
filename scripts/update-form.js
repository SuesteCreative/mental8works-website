const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('.git') && !file.includes('node_modules')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.html')) results.push(file);
        }
    });
    return results;
}

const files = walk('.');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace form tag
    let newContent = content.replace(/<form[^>]*onsubmit=[\"']sendMail\(event\)[\"'][^>]*>/gi, '<form action="https://formspree.io/pedrotovarporto@gmail.com" method="POST">');

    // Replace names
    newContent = newContent.replace(/<input\s+type="text"\s+class="form-control"\s+id="contactName"\s+required>/gi, '<input type="text" name="Nome" class="form-control" id="contactName" required>');
    newContent = newContent.replace(/<input\s+type="email"\s+class="form-control"\s+id="contactEmail"\s+required>/gi, '<input type="email" name="Email" class="form-control" id="contactEmail" required>');
    newContent = newContent.replace(/<textarea\s+class="form-control"\s+rows="4"\s+id="contactMessage"\s+required><\/textarea>/gi, '<textarea name="Mensagem" class="form-control" rows="4" id="contactMessage" required></textarea>');

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated form in: ' + file);
    }
});
