import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

const SKIP_FILES = [
  'Index.tsx', 
  'UniversalMediaConverter.tsx', 
  'FrameExtractor.tsx', 
  'SpriteStudio.tsx'
];

const LEFT_SIDEBAR_REGEX = /<aside className="hidden min-\[1850px\]:flex[^>]*slide-in-from-left-8[^>]*>[\s\S]*?<\/aside>/g;
const RIGHT_SIDEBAR_REGEX = /<aside className="hidden min-\[1850px\]:flex[^>]*slide-in-from-right-8[^>]*>[\s\S]*?<\/aside>/g;

files.forEach(file => {
  if (SKIP_FILES.includes(file)) return;

  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;

  if (LEFT_SIDEBAR_REGEX.test(content)) {
    content = content.replace(LEFT_SIDEBAR_REGEX, '<SponsorSidebars position="left" />');
    modified = true;
  }

  if (RIGHT_SIDEBAR_REGEX.test(content)) {
    content = content.replace(RIGHT_SIDEBAR_REGEX, '<SponsorSidebars position="right" />');
    modified = true;
  }

  if (modified) {
    if (!content.includes('import SponsorSidebars')) {
      if (content.includes('import AdPlaceholder')) {
        content = content.replace(
          /import AdPlaceholder from "@\/components\/AdPlaceholder";/,
          'import AdPlaceholder from "@/components/AdPlaceholder";\nimport SponsorSidebars from "@/components/SponsorSidebars";'
        );
      } else {
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
          const endOfLine = content.indexOf('\n', lastImportIndex);
          content = content.slice(0, endOfLine + 1) + 
                    'import SponsorSidebars from "@/components/SponsorSidebars";\n' + 
                    content.slice(endOfLine + 1);
        }
      }
    }
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${file}`);
  }
});
