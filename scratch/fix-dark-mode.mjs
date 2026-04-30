const fs = require('fs');
const path = require('path');
const pagesDir = path.join('c:/Users/ariel/Projects/privacy-tools-suite/src/pages');
let filesFixed = 0;
for (const file of fs.readdirSync(pagesDir)) {
  if (!file.endsWith('.tsx')) continue;
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('document.documentElement.classList.contains("dark")')) {
    content = content.replace(
      /document\.documentElement\.classList\.contains\("dark"\)/g,
      '(typeof document !== "undefined" && document.documentElement.classList.contains("dark"))'
    );
    
    fs.writeFileSync(filePath, content);
    filesFixed++;
  }
}
console.log('Fixed ' + filesFixed + ' files.');
