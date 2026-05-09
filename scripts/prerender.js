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
    },
    {
      to: '/insights',
      seoTitle: "Technical Insights — Developer Journal & Privacy Manifesto",
      seoDescription: "Explore our technical manifestos on No-Egress computing, browser sandbox architecture, and the future of local-first web utilities."
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
    const relativePath = tool.to.replace(/^\//, ''); 
    const filePath = path.join(distPath, `${relativePath}.html`);
    const fileDir = path.dirname(filePath);

    // Ensure parent directory exists (for nested paths)
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    // A. Render React App to HTML string
    const { html: appHtml } = render(tool.to);

    let content = template;

    // B. Inject HTML into root
    content = content.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    // C. Inject Metadata
    const title = tool.seoTitle || tool.title || 'PrivateTools';
    const description = tool.seoDescription || tool.description || 'Private, client-side utility tools.';
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
    const canonicalTag = `\n  <link rel="canonical" href="${canonicalUrl}" />`;
    // We try to replace the existing canonical tag or the placeholder
    if (content.includes('<!-- CANONICAL_PLACEHOLDER -->')) {
      content = content.replace(/<!-- CANONICAL_PLACEHOLDER -->\s*<link rel="canonical" href=".*?" \/>/, `<!-- CANONICAL_PLACEHOLDER -->${canonicalTag}`);
    } else {
      content = content.replace(/\s*<link rel="canonical" href=".*?" \/>/, canonicalTag);
    }

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

    const jsonLdScript = `\n  <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>`;
    if (content.includes('<!-- JSON_LD_PLACEHOLDER -->')) {
      content = content.replace('<!-- JSON_LD_PLACEHOLDER -->', `<!-- JSON_LD_PLACEHOLDER -->${jsonLdScript}`);
    } else {
      // Fallback: inject before </body>
      content = content.replace('</body>', `${jsonLdScript}\n</body>`);
    }

    // Write file
    fs.writeFileSync(filePath, content);
  }

  // Handle Home page rendering correctly
  const homeHtml = render('/').html;
  let homeContent = template.replace('<div id="root"></div>', `<div id="root">${homeHtml}</div>`);
  fs.writeFileSync(path.join(distPath, 'index.html'), homeContent);

  // --- Generate Sitemap ---
  console.log('[PRERENDER] Generating sitemap.xml...');
  const today = new Date().toISOString().split('T')[0];
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Home Page
  sitemapContent += `
  <url>
    <loc>https://privateutils.com/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>`;

  // Tools Pages
  for (const tool of toolsMetadata) {
    const url = `https://privateutils.com${tool.to.replace(/\/$/, '')}`;
    sitemapContent += `
  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>`;
  }

  // Manual & Info Pages
  for (const page of manualPages) {
    const url = `https://privateutils.com${page.to}`;
    sitemapContent += `
  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.5</priority>
    <changefreq>monthly</changefreq>
  </url>`;
  }

  sitemapContent += `\n</urlset>`;
  fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemapContent);


  console.log('[PRERENDER] Full HTML static routes generated successfully.');
}

run().catch(err => {
  console.error('[PRERENDER] Error:', err);
  process.exit(1);
});
