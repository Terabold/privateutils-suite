import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, '../dist/server/entry-server.js');

// Catch any console.errors during render
const origError = console.error;
const errors = [];
console.error = (...args) => {
  errors.push(args.join(' '));
  origError(...args);
};

const { render } = await import(pathToFileURL(serverEntryPath).href);

try {
  const { html } = render('/password-generator');
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log('TEXT LENGTH:', text.length);
  console.log('HAS LOADING FALLBACK:', text.includes('Loading Forge'));
  console.log('HAS PASSWORD UI:', text.toLowerCase().includes('password'));
  
  if (errors.length > 0) {
    console.log('\nErrors during render:');
    errors.forEach(e => console.log(' -', e.substring(0, 200)));
  }
} catch(e) {
  console.log('RENDER ERROR:', e.message);
  console.log(e.stack?.substring(0, 500));
}
