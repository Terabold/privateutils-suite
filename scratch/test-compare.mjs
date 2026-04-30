import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import just the SSR bundle to get the PasswordGenerator component
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");
const mod = await import(pathToFileURL(serverEntryPath).href);

// Compare two routes - one that works (index) vs one that doesnt (tool page)
const indexResult = mod.render("/");
const toolResult = mod.render("/password-generator");

const indexText = indexResult.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const toolText = toolResult.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

console.log("=== INDEX PAGE ===");
console.log("Length:", indexText.length);
console.log("Has tool cards:", indexText.toLowerCase().includes("password generator"));
console.log("First 200 chars:", indexText.substring(0, 200));

console.log("\n=== TOOL PAGE ===");
console.log("Length:", toolText.length);
console.log("Has Loading:", toolText.includes("Loading Forge"));
console.log("First 200 chars:", toolText.substring(0, 200));
