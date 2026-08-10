/* eslint-disable */
const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('src/app/(marketing)');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Remove import
    content = content.replace(/import { Reveal } from "@\/components\/marketing\/Reveal"\r?\n/g, '');
    
    // Remove <Reveal ...> tags but keep content inside
    content = content.replace(/<Reveal[^>]*>/g, '');
    content = content.replace(/<\/Reveal>/g, '');
    
    fs.writeFileSync(file, content);
});
console.log('Fixed Reveal tags in marketing pages.');
