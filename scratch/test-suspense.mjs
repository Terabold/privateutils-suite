import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Patch React to log when something throws a Promise
import React from "react";
const origCreateElement = React.createElement;

// We need to see what component is actually causing the Suspense fallback
// Let's add tracing to renderToString
import { renderToString } from "react-dom/server";
const origRTS = renderToString;

// Try rendering specific components directly to isolate the problem
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");
const mod = await import(pathToFileURL(serverEntryPath).href);

// Check the rendered HTML more carefully - look for <!--$!--> (Suspense fallback marker)
const { html } = mod.render("/password-generator");

// Find Suspense boundary markers
const idx1 = html.indexOf('<!--$!-->'); // Suspense fallback start
const idx2 = html.indexOf('<!--/$-->'); // Suspense boundary end

console.log("Suspense fallback start (<!--$!-->):", idx1);
console.log("Suspense boundary end (<!--/$-->):", idx2);

if (idx1 >= 0) {
  console.log("\nContext around Suspense fallback:");
  console.log(html.substring(Math.max(0, idx1-200), idx1+400));
}
