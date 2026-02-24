const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const file_path = path.join(dir, file);
        const stat = fs.statSync(file_path);
        if (stat && stat.isDirectory()) {
            if (!file_path.includes('.git') && !file_path.includes('node_modules')) {
                results = results.concat(walk(file_path));
            }
        } else {
            if (file_path.endsWith('.html')) results.push(file_path);
        }
    });
    return results;
}

const htmlFiles = walk('.');

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Remove the inline style from the sueste-link
    content = content.replace(/class=\"sueste-link\"\s+target=\"_blank\"\s+rel=\"noopener noreferrer\"\s+style=\"[^\"]+\"/g, 'class=\"sueste-link\" target=\"_blank\" rel=\"noopener noreferrer\"');

    // Increment CSS cache buster to override the previous style
    content = content.replace(/styles\.css\?v=[0-9.]+/g, 'styles.css?v=2.5');

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Cleaned inline styles on sueste-link');
