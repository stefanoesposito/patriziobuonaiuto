/** Read-only by default. Run through `sanity exec --with-user-token` from studio/. */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename } from "node:path";
import { getCliClient } from "sanity/cli";
const root = fileURLToPath(new URL("../../", import.meta.url));
const source = JSON.parse(
  await readFile(`${root}/web/src/lib/legacy-content.json`, "utf8"),
);
const client = getCliClient({ apiVersion: "2026-02-01" }).withConfig({
  useCdn: false,
});
if (
  client.config().projectId !== "abnzzs23" ||
  client.config().dataset !== "production"
)
  throw new Error("Unexpected destination; no writes performed.");
const apply = process.env.SANITY_MIGRATION_APPLY === "abnzzs23";
const localized = (values: Record<string, string>, kind = "String") =>
  Object.entries(values).map(([language, value]) => ({
    _type: `internationalizedArray${kind}Value`,
    _key: language,
    language,
    value,
  }));
const paragraphs = (strings: string[]) =>
  strings.map((text, i) => ({
    _type: "block",
    _key: `p${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `s${i}`, text, marks: [] }],
  }));
const imagePaths = new Set<string>();
source.artworks.forEach((a: { image: string; gallery: string[] }) => {
  imagePaths.add(a.image);
  a.gallery.forEach((p) => imagePaths.add(p));
});
source.processes.forEach((p: { images: string[] }) =>
  p.images.forEach((i) => imagePaths.add(i)),
);
Object.values(source.pages).forEach((p: any) =>
  p.images.forEach((i: string) => imagePaths.add(i)),
);
imagePaths.add(source.comparison.originalImage);
const existing = await client.fetch(
  '*[_type in ["artwork","process","page","siteSettings"]]{_id,_type,legacyId,slug}',
);
const summary = {
  project: "abnzzs23",
  dataset: "production",
  mode: apply ? "apply" : "dry-run",
  documentsPlanned: 30,
  artworks: source.artworks.length,
  processProjects: source.processes.length,
  processImages: source.processes.reduce(
    (n: number, p: any) => n + p.images.length,
    0,
  ),
  localizedPages: Object.keys(source.pages).length,
  siteSettings: 1,
  imageSources: imagePaths.size,
  existingEditorialDocuments: existing.length,
  writesPerformed: false,
};
await mkdir(`${root}/migration/reports`, { recursive: true });
if (!apply) {
  await writeFile(
    `${root}/migration/reports/import-dry-run.json`,
    JSON.stringify(summary, null, 2) + "\n",
  );
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}
// Reruns recognize ordinary documents by stable source identity; editor changes are never overwritten.
const allIds = new Map(
  existing.filter((d: any) => d.legacyId).map((d: any) => [d.legacyId, d._id]),
);
for (const doc of existing) {
  const match = source.artworks.find((a: any) => a.slug === doc.slug?.current);
  if (match && doc.legacyId !== match.sourceKey)
    throw new Error(
      "An artwork already owns an imported slug; review before importing.",
    );
}
const duplicateKeys = existing.map((d: any) => d.legacyId).filter(Boolean);
if (new Set(duplicateKeys).size !== duplicateKeys.length)
  throw new Error(
    "Duplicate legacyId in destination; review before importing.",
  );
const assets = new Map<string, string>();
async function image(path: string, title: Record<string, string>) {
  let ref = assets.get(path);
  if (!ref) {
    if (path.startsWith("/static/")) {
      const asset = await client.assets.upload(
        "image",
        createReadStream(root + path),
        { filename: basename(path) },
      );
      ref = asset._id;
    } else if (path === source.comparison.originalImage) {
      const response = await fetch(path);
      if (
        !response.ok ||
        !response.headers.get("content-type")?.startsWith("image/")
      )
        throw new Error(
          "Original Klimt image unavailable; import interrupted.",
        );
      const asset = await client.assets.upload(
        "image",
        Buffer.from(await response.arrayBuffer()),
        { filename: "gustav-klimt-adele-bloch-bauer-i-1907.jpg" },
      );
      ref = asset._id;
    } else throw new Error("Unexpected remote asset");
    assets.set(path, ref);
  }
  return {
    _type: "editorialImage",
    asset: { _type: "reference", _ref: ref },
    alt: localized(title),
  };
}
async function createOrdinary(legacyId: string, doc: Record<string, unknown>) {
  const old = allIds.get(legacyId);
  if (old) return old;
  const created = await client.create({ ...doc, legacyId });
  allIds.set(legacyId, created._id);
  return created._id;
}
for (const a of source.artworks) {
  if (allIds.has(a.sourceKey)) continue;
  const doc: any = {
    _type: "artwork",
    title: localized(a.title),
    slug: { _type: "slug", current: a.slug },
    description: localized(a.description, "Text"),
    sourceArtist: a.sourceArtist,
    categories: a.categories,
    mainImage: await image(a.image, a.title),
    needsEditorialReview: a.needsEditorialReview,
    gallery: [],
  };
  for (const src of a.gallery)
    doc.gallery.push({
      ...(await image(src, a.title)),
      _key: `image${doc.gallery.length}`,
    });
  if (a.slug === source.comparison.artworkSlug) {
    doc.beforeImage = await image(source.comparison.originalImage, {
      it: source.comparison.originalTitle,
      en: "Gustav Klimt, Portrait of Adele Bloch-Bauer I, 1907",
    });
    doc.beforeCredit = source.comparison.originalTitle;
  }
  await createOrdinary(a.sourceKey, doc);
}
for (const p of source.processes) {
  if (allIds.has(p.sourceKey)) continue;
  const images = [];
  for (const [i, src] of p.images.entries())
    images.push({
      ...(await image(src, {
        it: `${p.title.it} — fase ${i + 1}`,
        en: `${p.title.en} — step ${i + 1}`,
      })),
      _key: `step${i + 1}`,
    });
  await createOrdinary(p.sourceKey, {
    _type: "process",
    title: localized(p.title),
    slug: { _type: "slug", current: p.slug },
    images,
  });
}
for (const p of Object.values(source.pages) as any[]) {
  const old = existing.find((d: any) => d._id === p.key);
  if (old) continue;
  const images = [];
  for (const [i, src] of p.images.entries())
    images.push({
      ...(await image(src, {
        it: "Patrizio Buonaiuto nel suo percorso artistico",
        en: "Patrizio Buonaiuto in his artistic journey",
      })),
      _key: `image${i}`,
    });
  await client.createIfNotExists({
    _id: p.key,
    _type: "page",
    legacyId: p.legacyUrl,
    kind: p.kind,
    language: p.language,
    title: p.title,
    body: paragraphs(p.paragraphs),
    images,
  });
}
const featuredArtworks = source.featured.map((slug: string) => {
  const artwork = source.artworks.find((a: any) => a.slug === slug);
  return {
    _type: "reference",
    _key: slug,
    _ref: allIds.get(artwork.sourceKey),
  };
});
const comparison = source.artworks.find(
  (a: any) => a.slug === source.comparison.artworkSlug,
);
await client.createIfNotExists({
  _id: "siteSettings",
  _type: "siteSettings",
  ...source.settings,
  featuredArtworks,
  comparisonArtwork: {
    _type: "reference",
    _ref: allIds.get(comparison.sourceKey),
  },
});
await mkdir(`${root}/migration/transformed`, { recursive: true });
await writeFile(
  `${root}/migration/transformed/id-manifest.json`,
  JSON.stringify(Object.fromEntries(allIds), null, 2),
);
const counts = await client.fetch(
  '{"artworks":count(*[_type=="artwork"]),"processes":count(*[_type=="process"]),"pages":count(*[_type=="page"]),"settings":count(*[_id=="siteSettings"]),"missingImageReferences":count(*[_type=="artwork"&&!defined(mainImage.asset->url)])}',
);
const result = { ...summary, writesPerformed: true, counts };
await writeFile(
  `${root}/migration/reports/import-result.json`,
  JSON.stringify(result, null, 2) + "\n",
);
console.log(JSON.stringify(result, null, 2));
