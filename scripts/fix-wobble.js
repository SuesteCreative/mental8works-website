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

    // Replace wave sliding logic with wobble exact string
    const newSvg = '<span class="wave-brand"><svg viewBox="0 0 60 10" preserveAspectRatio="none" style="width: 60px; height: 10px; display: inline-block; vertical-align: middle; margin-left: 4px;"><path d="M0 5 Q 7.5 0, 15 5 T 30 5 T 45 5 T 60 5" fill="none" stroke="currentColor" stroke-width="0.8"></path></svg></span>';

    // Catch every <span class="wave-brand"> inside files and replace the inner content completely. 
    // This allows us to confidently strip whatever form of SVG we have right now
    content = content.replace(/<span class=\"wave-brand\">.*?<\/span>/gs, newSvg);

    // Increment CSS cache buster to override the previous style
    content = content.replace(/styles\.css\?v=[0-9.]+/g, 'styles.css?v=2.4');

    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed SVG Wobble: ' + file);
});
