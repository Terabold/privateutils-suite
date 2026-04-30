import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");

// Read the bundle and find what Ul contains for PasswordGenerator
const fs = await import("fs");
const content = fs.readFileSync(serverEntryPath, "utf-8");

// Find the position of PasswordGenerator.tsx in the Ul dict
const dictIdx = content.indexOf('"./pages/PasswordGenerator.tsx":');
console.log("Dict entry found:", dictIdx >= 0);
if (dictIdx >= 0) {
  console.log("Entry:", content.substring(dictIdx, dictIdx + 80));
}

// Find where Ul is assigned (the full dict start)
const ulIdx = content.indexOf("Ul=Object.assign(");
console.log("Ul assignment found:", ulIdx >= 0);

// Test the actual import
const mod = await import(pathToFileURL(serverEntryPath).href);
console.log("Module imported successfully");
console.log("Module exports:", Object.keys(mod));
