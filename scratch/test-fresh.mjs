import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Force cache bust by adding timestamp to URL  
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");
const url = pathToFileURL(serverEntryPath).href + "?t=" + Date.now();
const mod = await import(url);

const { html } = mod.render("/password-generator");
console.log("HTML length:", html.length);
console.log("Has Loading:", html.includes("Loading Forge Artifact"));
console.log("Has Suspense fallback (<!--$!-->):", html.includes("<!--$!-->"));

// Check for document error specifically
const docError = html.includes("document is not defined");
console.log("Has document error:", docError);

// Extract text
const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
console.log("Text length:", text.length);
console.log("First 300 chars:", text.substring(0, 300));
