import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");
const mod = await import(pathToFileURL(serverEntryPath).href);

const routes = ["/password-generator", "/lorem-generator", "/hash-lab"];
for (const route of routes) {
  const { html } = mod.render(route);
  const hasLoading = html.includes('Loading Forge Artifact');
  const hasFreeTools = html.includes('Free tools that');
  const hasHome = html.includes('free tools');
  console.log(`${route}: length=${html.length}, hasLoading=${hasLoading}, hasFreeTools=${hasFreeTools}`);
}

// Also check the index
const indexResult = mod.render("/");
console.log(`/: length=${indexResult.html.length}, hasLoading=${indexResult.html.includes('Loading Forge Artifact')}, hasFreeTools=${indexResult.html.includes('Free tools that')}`);
