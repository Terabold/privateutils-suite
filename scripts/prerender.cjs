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
  let content = template;

  const title = tool.seoTitle || tool.title;
  const description = tool.seoDescription || tool.description;
  const canonicalUrl = `https://privateutils.com${tool.to.replace(/\/$/, '')}`; // Enforce no-trailing-slash

  // Replace Title
  content = content.replace(/<title>[\s\S]*?<\/title>/g, `<title>${title}</title>`);

  // Replace Description Meta
  content = content.replace(
    /<meta name="description"[\s\S]*?content="[\s\S]*?" \/>/g,
    `<meta name="description" content="${description}" />`
  );

  // Replace OG Title & Description
  content = content.replace(/<meta property="og:title"[\s\S]*?content="[\s\S]*?" \/>/g, `<meta property="og:title" content="${title}" />`);
  content = content.replace(/<meta property="og:description"[\s\S]*?content="[\s\S]*?" \/>/g, `<meta property="og:description" content="${description}" />`);
  content = content.replace(/<meta property="og:url"[\s\S]*?content="[\s\S]*?" \/>/g, `<meta property="og:url" content="${canonicalUrl}" />`);

  // Replace Twitter Title & Description
  content = content.replace(/<meta name="twitter:title"[\s\S]*?content="[\s\S]*?" \/>/g, `<meta name="twitter:title" content="${title}" />`);
  content = content.replace(/<meta name="twitter:description"[\s\S]*?content="[\s\S]*?" \/>/g, `<meta name="twitter:description" content="${description}" />`);


  // Inject Static Canonical URL
  const canonicalTag = `<!-- CANONICAL_PLACEHOLDER -->\n  <link rel="canonical" href="${canonicalUrl}" />`;
  content = content.replace(
    /<!-- CANONICAL_PLACEHOLDER -->\s*<link rel="canonical" href=".*?" \/>/,
    canonicalTag
  );

  // Inject JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": title.split(' |')[0].trim(),
    "description": description,
    "url": canonicalUrl,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "PrivateUtils",
      "url": "https://privateutils.com"
    }
  };

  const jsonLdScript = `<!-- JSON_LD_PLACEHOLDER -->\n  <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>`;
  content = content.replace('<!-- JSON_LD_PLACEHOLDER -->', jsonLdScript);

  // Write file
  fs.writeFileSync(path.join(routePath, 'index.html'), content);
});

console.log('[PRERENDER] Static routes generated successfully.');

