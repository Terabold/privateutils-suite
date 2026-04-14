import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  // 1. Load Metadata
  const toolsMetadata = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/toolsMetadata.json'), 'utf8'));

  // 2. Paths
  const distPath = path.join(__dirname, '../dist');
  const indexPath = path.join(distPath, 'index.html');
  const serverEntryPath = path.join(distPath, 'server/entry-server.js');

  const manualPages = [
    {
      to: '/about',
      seoTitle: "About PrivateUtils — The Mission of No-Egress Computing",
      seoDescription: "Learn about the mission of PrivateUtils, the technical challenges of client-side computing, and why we believe your data should never leave your hardware."
    },
    {
      to: '/technical-architecture',
      seoTitle: "Technical Architecture — SSR & Hydration Pipeline",
      seoDescription: "A deep dive into the PrivateUtils engine, exploring synchronous SSR, hydration strategies, and how we deliver professional tools with zero egress."
    },
    {
      to: '/contact',
      seoTitle: "Contact Support — PrivateUtils Project",
      seoDescription: "Get in touch with the PrivateUtils team for support, feature requests, or collaboration opportunities."
    }
  ];

  if (!fs.existsSync(indexPath)) {
    console.error('[PRERENDER] dist/index.html not found. Run "vite build" first.');
    process.exit(1);
  }

  if (!fs.existsSync(serverEntryPath)) {
    console.error('[PRERENDER] dist/server/entry-server.js not found. Run "vite build --ssr" first.');
    process.exit(1);
  }

  // 3. Import SSR bundle (Win Fix: must be file:// URL)
  const { render } = await import(pathToFileURL(serverEntryPath).href);


  // 4. Read template
  const template = fs.readFileSync(indexPath, 'utf8');

  console.log(`[PRERENDER] Generating ${toolsMetadata.length} tools and ${manualPages.length} authority pages...`);

  const allPages = [...toolsMetadata, ...manualPages];

  for (const tool of allPages) {
    const routePath = path.join(distPath, tool.to.replace(/^\//, ''));

    // Ensure directory exists
    if (!fs.existsSync(routePath)) {
      fs.mkdirSync(routePath, { recursive: true });
    }

    // A. Render React App to HTML string
    // We pass the URL to the StaticRouter inside the render function
    const { html: appHtml } = render(tool.to);

    let content = template;

    // B. Inject HTML into root
    content = content.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    // C. Inject Metadata (Keep existing logic as requested)
    const title = tool.seoTitle || tool.title;
    const description = tool.seoDescription || tool.description;
    const canonicalUrl = `https://privateutils.com${tool.to.replace(/\/$/, '')}`; 

    // Replace Title
    content = content.replace(/<title>[\s\S]*?<\/title>/g, `<title>${title}</title>`);

    // Replace Description Meta
    content = content.replace(
      /<meta name="description"[\s\S]*?content="[\s\S]*?" \/>/g,
      `<meta name="description" content="${description}" />`
    );

    // Replace OG Tags
    content = content.replace(/<meta property="og:title"[\s\S]*?content="[\s\S]*?" \/>/g, `<meta property="og:title" content="${title}" />`);
    content = content.replace(/<meta property="og:description"[\s\S]*?content="[\s\S]*?" \/>/g, `<meta property="og:description" content="${description}" />`);
    content = content.replace(/<meta property="og:url"[\s\S]*?content="[\s\S]*?" \/>/g, `<meta property="og:url" content="${canonicalUrl}" />`);

    // Replace Twitter Tags
    content = content.replace(/<meta name="twitter:title"[\s\S]*?content="[\s\S]*?" \/>/g, `<meta name="twitter:title" content="${title}" />`);
    content = content.replace(/<meta name="twitter:description"[\s\S]*?content="[\s\S]*?" \/>/g, `<meta name="twitter:description" content="${description}" />`);

    // Inject Static Canonical URL
    const canonicalTag = `<!-- CANONICAL_PLACEHOLDER -->\n  <link rel="canonical" href="${canonicalUrl}" />`;
    content = content.replace(
      /<!-- CANONICAL_PLACEHOLDER -->\s*<link rel="canonical" href=".*?" \/>/,
      canonicalTag
    );

    // Inject JSON-LD
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
  }

  // Handle Home page rendering correctly
  const homeHtml = render('/').html;
  let homeContent = template.replace('<div id="root"></div>', `<div id="root">${homeHtml}</div>`);
  fs.writeFileSync(path.join(distPath, 'index.html'), homeContent);

  console.log('[PRERENDER] Full HTML static routes generated successfully.');
}

run().catch(err => {
  console.error('[PRERENDER] Error:', err);
  process.exit(1);
});
