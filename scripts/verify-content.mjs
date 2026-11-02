import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base = process.env.VERIFY_URL || "http://127.0.0.1:3000";
const source = JSON.parse(
  await readFile(
    new URL("../web/src/lib/legacy-content.json", import.meta.url),
    "utf8",
  ),
);
const decode = (s) =>
  s
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
let count = 0;
for (const lang of ["it", "en"]) {
  const routes = [
    `/${lang}`,
    `/${lang}/${lang === "it" ? "su-di-me" : "about-me"}`,
    `/${lang}/portfolio`,
    `/${lang}/contact`,
    ...source.artworks.map((a) => `/${lang}/opere/${a.slug}`),
    ...source.processes.map((p) => `/${lang}/processi/${p.slug}`),
  ];
  for (let i = 0; i < routes.length; i += 4)
    await Promise.all(
      routes.slice(i, i + 4).map(async (path) => {
        const response = await fetch(base + path);
        assert.equal(response.status, 200, path);
        const html = await response.text();
        assert(
          html.includes(`<html lang="${lang}"`),
          `${path}: document language`,
        );
        assert(/<h1\b/.test(html), `${path}: readable heading`);
        assert(html.includes('rel="canonical"'), `${path}: canonical`);
        assert(html.includes('name="description"'), `${path}: description`);
        if (!process.env.EXPECT_INDEX)
          assert(html.includes("noindex"), `${path}: preview noindex`);
        if (path.endsWith("su-di-me") || path.endsWith("about-me"))
          for (const p of source.pages[`about-${lang}`].paragraphs)
            assert(
              decode(html).includes(p),
              `${path}: full biography paragraph`,
            );
        if (path.includes("/opere/")) {
          const ld = html.match(
            /<script type="application\/ld\+json">(.*?)<\/script>/s,
          );
          assert(ld, path);
          const schema = JSON.parse(ld[1]);
          assert.equal(schema.creator.name, "Patrizio Buonaiuto");
        }
        count++;
      }),
    );
}
const images = new Set([
  ...source.artworks.flatMap((a) => [a.image, ...a.gallery]),
  ...source.processes.flatMap((p) => p.images),
  ...Object.values(source.pages).flatMap((p) => p.images),
]);
for (const path of images) {
  const r = await fetch(base + path, { method: "HEAD" });
  assert.equal(r.status, 200, path);
}
for (const [path, to] of [
  ["/", "/it"],
  ["/it/index", "/it"],
  ["/en/index", "/en"],
]) {
  const r = await fetch(base + path, { redirect: "manual" });
  assert([307, 308].includes(r.status), path);
  assert(r.headers.get("location")?.endsWith(to), path);
}
for (const path of ["/it/inesistente", "/it/opere/inesistente"])
  assert.equal((await fetch(base + path)).status, 404, path);
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
assert(sitemap.includes("https://patriziobuonaiuto.vercel.app/it/su-di-me"));
assert(!sitemap.includes("127.0.0.1"));
assert(!sitemap.includes("opera-originale-1"));
const robots = await (await fetch(base + "/robots.txt")).text();
if (!process.env.EXPECT_INDEX) assert(robots.includes("Disallow: /"));
console.log(
  `PASS: ${count} page routes, ${images.size} local images, full IT/EN biography, artwork attribution, metadata, redirects, 404s, sitemap and preview noindex.`,
);
