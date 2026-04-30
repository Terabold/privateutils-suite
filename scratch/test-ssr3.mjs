import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");

// Import the full bundle
const mod = await import(pathToFileURL(serverEntryPath).href);

// Check render with simpler approach
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";

// Try rendering a simple test to see if react works
const simpleHtml = renderToString(React.createElement("div", null, "Hello SSR"));
console.log("Basic React SSR works:", simpleHtml);

// Now call the actual render
const result = mod.render("/password-generator");
const text = result.html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
console.log("Render text length:", text.length);
console.log("Has Loading:", text.includes("Loading Forge"));

// Check for any specific content from PasswordGenerator page
const hasGenerate = text.includes("Generate");
const hasLength = text.includes("Length") || text.includes("length");
console.log("Has 'Generate' text:", hasGenerate);
console.log("Has 'Length' text:", hasLength);
console.log("Full text:", text.substring(0, 300));
