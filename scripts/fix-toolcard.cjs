const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'ToolCard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/pt-10 pb-6 px-7/g, 'pt-8 pb-6 px-6');
content = content.replace(/rounded-xl bg-gradient-to-br/g, 'rounded-lg bg-gradient-to-br');

fs.writeFileSync(filePath, content);
console.log('Updated ToolCard.tsx');
