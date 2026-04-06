const fs = require('fs');
const path = require('path');

// 1. Load Metadata
const toolsMetadata = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/toolsMetadata.json'), 'utf8'));

// 2. Paths
const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('[PRERENDER] dist/index.html not found. Run "vite build" first.');
  process.exit(1);
}

// 3. Read template
const template = fs.readFileSync(indexPath, 'utf8');

console.log(`[PRERENDER] Generating ${toolsMetadata.length} static routes...`);

toolsMetadata.forEach(tool => {
  const routePath = path.join(distPath, tool.to.replace(/^\//, ''));
  
  // Ensure directory exists
  if (!fs.existsSync(routePath)) {
    fs.mkdirSync(routePath, { recursive: true });
  }

  // Inject Metadata
  // We use simple string replacement for reliability in a build script context
  let content = template;

  // Replace Title
  content = content.replace(/<title>.*?<\/title>/, `<title>${tool.seoTitle}</title>`);

  // Replace Description Meta
  content = content.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${tool.seoDescription}" />`
  );

  // Replace OG Title
  content = content.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${tool.seoTitle}" />`
  );

  // Replace OG Description
  content = content.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${tool.seoDescription}" />`
  );

  // Replace Twitter Title
  content = content.replace(
    /<meta name="twitter:title" content=".*?" \/>/,
    `<meta name="twitter:title" content="${tool.seoTitle}" />`
  );

  // Replace Twitter Description
  content = content.replace(
    /<meta name="twitter:description" content=".*?" \/>/,
    `<meta name="twitter:description" content="${tool.seoDescription}" />`
  );

  // Write file
  fs.writeFileSync(path.join(routePath, 'index.html'), content);
});

console.log('[PRERENDER] Static routes generated successfully.');
