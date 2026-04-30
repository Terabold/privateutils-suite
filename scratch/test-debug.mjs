import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");
const mod = await import(pathToFileURL(serverEntryPath).href);

// Monkey-patch Suspense to log when fallback is shown
const origCreateElement = React.createElement.bind(React);
React.createElement = function(type, props, ...children) {
  if (type && type.$$typeof && type.$$typeof.toString().includes('REACT_SUSPENSE')) {
    console.log('[SUSPENSE] Suspense boundary triggered - fallback will render');
  }
  return origCreateElement(type, props, ...children);
};

const result = mod.render("/password-generator");
const text = result.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
console.log("Output:", text.substring(0, 200));
