const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  path.join(__dirname, '..', 'src', 'components', 'ToolsGrid.tsx'),
  path.join(__dirname, '..', 'src', 'data', 'toolsMetadata.json'),
  path.join(__dirname, '..', 'src', 'config', 'categories.ts') // I suspect this exists
];

const categoryMapping = {
  "Video Studio": "Video",
  "Audio Lab": "Audio",
  "Image Studio": "Graphics",
  "Privacy Belt": "Security",
  "Dev Toolbox": "Engineering",
  "Text Studio": "Editor",
  "Quick Utils": "Utilities"
};

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    Object.keys(categoryMapping).forEach(oldCat => {
      const newCat = categoryMapping[oldCat];
      const regex = new RegExp(oldCat, 'g');
      content = content.replace(regex, newCat);
    });
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
});
