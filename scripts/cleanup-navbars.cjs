const fs = require('fs');
const path = require('path');
const dir = 'src/pages';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx') && file !== 'Index.tsx') {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove import
    content = content.replace(/import Navbar from ["']@\/components\/Navbar["'];\r?\n?/g, '');
    
    // Remove component instance
    content = content.replace(/<Navbar\s+[^>]*\/>/g, '');
    
    fs.writeFileSync(filePath, content);
    console.log(`Cleaned ${file}`);
  }
});
