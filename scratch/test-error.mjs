import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntryPath = path.join(__dirname, "../dist/server/entry-server.js");
const url = pathToFileURL(serverEntryPath).href + "?t=" + Date.now();
const mod = await import(url);

const { html } = mod.render("/password-generator");

// Find the exact error and stack trace  
const templateIdx = html.indexOf("<template");
if (templateIdx >= 0) {
  const templateEnd = html.indexOf("</template>", templateIdx);
  console.log("Template tag content:");
  console.log(html.substring(templateIdx, Math.min(templateEnd + 11, templateIdx + 2000)));
}
