import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");
const allExports = await import(pathToFileURL(serverEntryPath).href);

const { html } = allExports.render("/password-generator");

// The entry-server.tsx render function returns just the component HTML, not the full page
// So `html` is just the React-rendered tree, not the full index.html
console.log("HTML type:", typeof html);
console.log("HTML length:", html.length);
console.log("First 1000 chars of raw HTML:");
console.log(html.substring(0, 1000));
