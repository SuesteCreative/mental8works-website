const fs = require('fs');

const files = ['index.html', 'live_index.html', 'contactos/index.html'];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Revert to simple SVG without inline <animate> tags (the animation is now pure CSS via Slide)
    // Replace both the previously injected <animate> tags or whatever was there
    content = content.replace(/<svg viewBox=\"0 0 60 10\" preserveAspectRatio=\"none\" style=\"width: 60px; height: 10px; display: inline-block; vertical-align: middle; margin-left: 4px;\">.*?<\/svg>/gs,
        '<svg viewBox=\"0 0 60 10\" preserveAspectRatio=\"none\" style=\"width: 60px; height: 10px; display: inline-block; vertical-align: middle; margin-left: 4px;\"><path d=\"M0 5 Q 7.5 0, 15 5 T 30 5 T 45 5 T 60 5 T 75 5 T 90 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"wave-path\" /></svg>');

    // Optional: if it just has the `<path...>`, also replace that inside `<span class="wave-brand">...</span>`
    // but the regex above captures the whole SVG which is more robust.

    // 2. Formsubmit destination email
    content = content.replace(/pedrotovarporto@gmail\.com/g, 'mental8works@gmail.com');

    // 3. Increment CSS cache buster
    content = content.replace(/styles\.css\?v=[0-9.]+/g, 'styles.css?v=2.3');

    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed: ' + file);
});
