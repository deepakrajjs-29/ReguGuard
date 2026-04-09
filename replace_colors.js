const fs = require('fs');
const path = require('path');

const directory = './';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace primary indigo with primary azure
    content = content.replace(/99\s*,\s*102\s*,\s*241/g, '14,165,233');
    // Replace accent violet with accent teal
    content = content.replace(/139\s*,\s*92\s*,\s*246/g, '20,184,166');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + filePath);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.html') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    }
}

processDirectory(directory);
console.log('Done.');
