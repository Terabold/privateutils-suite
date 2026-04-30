import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");
const mod = await import(pathToFileURL(serverEntryPath).href);

// Patch console.error to capture React errors
const origError = console.error.bind(console);
const capturedErrors = [];
console.error = (...args) => {
  capturedErrors.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};

const { html } = mod.render("/password-generator");

console.error = origError;

// Show any React errors
if (capturedErrors.length > 0) {
  console.log("React errors during SSR:");
  capturedErrors.forEach(e => console.log(" ERROR:", e.substring(0, 300)));
} else {
  console.log("No React errors during SSR");
}

// Check what we got
const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
console.log("Output length:", text.length);
console.log("Shows loading:", text.includes("Loading Forge"));
