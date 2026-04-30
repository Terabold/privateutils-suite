import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, '../dist/server/entry-server.js');

const { render } = await import(pathToFileURL(serverEntryPath).href);
const { html } = render('/password-generator');

// Strip tags for readable output
const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
console.log('TEXT LENGTH:', text.length);
console.log('FIRST 500 CHARS:', text.substring(0, 500));
