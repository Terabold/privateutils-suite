const fs = require('fs');
const path = require('path');

// Go up from scripts/ to root, then into src/pages
const pagesDir = path.join(__dirname, '..', 'src', 'pages');

if (!fs.existsSync(pagesDir)) {
    console.error(`Directory not found: ${pagesDir}`);
    process.exit(1);
}

const files = fs.readdirSync(pagesDir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix the Back Button styles for light mode and radius
    const searchPattern = /bg-black\/60 shadow-2xl/g;
    const replacement = 'bg-background/50 backdrop-blur-md shadow-xl';
    
    const searchPattern2 = /border-white\/20/g;
    const replacement2 = 'border-primary/20';

    const searchPattern3 = /rounded-2xl border/g; 
    const replacement3 = 'rounded-xl border';

    if (content.includes('group/back')) {
        content = content.replace(searchPattern, replacement);
        content = content.replace(searchPattern2, replacement2);
        content = content.replace(searchPattern3, replacement3);
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
  }
});
