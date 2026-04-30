import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");
const mod = await import(pathToFileURL(serverEntryPath).href);

// Track all Promise throws - wrap React's internal mechanism
// React throws promises (thenables) to suspend. Let's catch those.

let suspenseCount = 0;
const origProcessNextTick = process.nextTick.bind(process);

// Intercept unhandled promise rejections
process.on('uncaughtException', (err) => {
  console.log('[UNCAUGHT]', err.message?.substring(0, 100));
});

// Capture console.error for React SSR warnings
const origError = console.error.bind(console);
const errors = [];
console.error = (...args) => {
  const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
  errors.push(msg.substring(0, 200));
};

try {
  const { html } = mod.render("/password-generator");
  
  if (errors.length > 0) {
    console.log("React warnings:");
    errors.forEach(e => console.log(" -", e));
  }
  
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log("Output length:", text.length);
  console.log("Output:", text.substring(0, 300));
} catch(err) {
  console.log("RENDER THREW:", err.message);
  if (err && typeof err.then === 'function') {
    console.log("** IT THREW A PROMISE (Suspense) **");
  }
}

console.error = origError;
