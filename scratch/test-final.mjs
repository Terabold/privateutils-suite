import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");
const mod = await import(pathToFileURL(serverEntryPath).href);

const { html } = mod.render("/password-generator");

// Check for password-generator specific content
console.log("HTML length:", html.length);
console.log("Has 'Password Length':", html.includes('Password Length'));
console.log("Has 'Generate':", html.includes('Generate'));
console.log("Has 'password-generator':", html.includes('password-generator'));
console.log("Has 'Index' page content (Free tools):", html.includes('Free tools that'));
console.log("Has Loading fallback:", html.includes('Loading Forge Artifact'));

// Check for the Suspense boundary markers
const suspenseBoundaries = (html.match(/<!--\$\?-->/g) || []).length;
const suspenseFallbacks = (html.match(/<!--\$!-->/g) || []).length;
console.log("Suspense boundaries (pending):", suspenseBoundaries);
console.log("Suspense fallbacks:", suspenseFallbacks);
