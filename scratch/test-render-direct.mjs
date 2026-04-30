import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");
const { render } = await import(pathToFileURL(serverEntryPath).href);

// Test specific routes
const pgResult = render("/password-generator");
console.log("/password-generator HTML length:", pgResult.html.length);
console.log("Has Loading:", pgResult.html.includes("Loading Forge Artifact"));

const indexResult = render("/");
console.log("/ HTML length:", indexResult.html.length);
console.log("Index has Free tools:", indexResult.html.includes("Free tools"));
