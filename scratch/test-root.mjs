import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToString } from "react-dom/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");
const allExports = await import(pathToFileURL(serverEntryPath).href);

// The ssrLazy exports are single-letter names. 
// render is the named export. Let's call render directly and check HTML structure.
const { html } = allExports.render("/password-generator");

// Check what's in the root div
const rootMatch = html.match(/<div id="root">([\s\S]*?)<\/div>/);
if (rootMatch) {
  const rootContent = rootMatch[1];
  const rootText = rootContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log("Root div text:", rootText.substring(0, 500));
} else {
  console.log("Could not find root div pattern");
  // Show a small slice of the html
  const rootIdx = html.indexOf('id="root"');
  if (rootIdx >= 0) {
    console.log("Root div area:", html.substring(rootIdx, rootIdx + 500));
  }
}
