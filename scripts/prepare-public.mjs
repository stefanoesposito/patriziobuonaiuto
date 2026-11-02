import { cp, mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
await mkdir(`${root}/web/public`, { recursive: true });
await cp(`${root}/static`, `${root}/web/public/static`, { recursive: true });
await cp(`${root}/static/concept`, `${root}/web/public/concept`, {
  recursive: true,
});
// Legacy templates stay in Git; published content is represented by the extracted snapshot.
await readFile(`${root}/web/src/lib/legacy-content.json`);
