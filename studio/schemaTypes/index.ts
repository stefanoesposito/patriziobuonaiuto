import {
  defineArrayMember,
  defineField,
  defineType,
  type PreviewValue,
} from "sanity";
const categories = [
  { title: "Copie d'autore", value: "art-replicas" },
  { title: "Ritratti", value: "portraits" },
  { title: "Trompe-l’œil", value: "trompe-l-oeil" },
  { title: "Opere originali", value: "originals" },
];
const localized = (name: string, title: string, type = "String") =>
  defineField({ name, title, type: `internationalizedArray${type}` });
const identity = defineField({
  name: "legacyId",
  title: "Identificativo della fonte",
  type: "string",
  readOnly: true,
  hidden: ({ value }) => !value,
});
const preview = {
  select: { titles: "title", media: "mainImage" },
  prepare({
    titles,
    media,
  }: {
    titles?: { language: string; value: string }[];
    media?: PreviewValue["media"];
  }) {
    return {
      title: titles?.find((x) => x.language === "it")?.value || "Senza titolo",
      media,
    };
  },
};
export const schemaTypes = [
  defineType({
    name: "blockContent",
    title: "Testo",
    type: "array",
    of: [
      defineArrayMember({
        type: "block",
        styles: [
          { title: "Testo", value: "normal" },
          { title: "Titolo", value: "h2" },
          { title: "Sottotitolo", value: "h3" },
        ],
        marks: {
          decorators: [
            { title: "Grassetto", value: "strong" },
            { title: "Corsivo", value: "em" },
          ],
          annotations: [
            {
              name: "link",
              type: "object",
              title: "Collegamento",
              fields: [
                defineField({
                  name: "href",
                  type: "url",
                  validation: (r) =>
                    r.uri({ scheme: ["https", "http", "mailto", "tel"] }),
                }),
              ],
            },
          ],
        },
      }),
    ],
  }),
  defineType({
    name: "editorialImage",
    title: "Immagine",
    type: "image",
    options: { hotspot: true },
    fields: [
      localized("alt", "Descrizione alternativa"),
      defineField({ name: "caption", title: "Didascalia", type: "string" }),
    ],
  }),
  defineType({
    name: "seo",
    title: "Motori di ricerca e condivisione",
    type: "object",
    fields: [
      localized("title", "Titolo SEO (facoltativo)"),
      localized("description", "Descrizione SEO (facoltativa)", "Text"),
      defineField({
        name: "image",
        title: "Immagine di condivisione",
        type: "editorialImage",
      }),
      defineField({
        name: "noIndex",
        title: "Escludi dai motori di ricerca",
        type: "boolean",
        initialValue: false,
      }),
    ],
  }),
  defineType({
    name: "artwork",
    title: "Opera",
    type: "document",
    groups: [
      { name: "content", title: "Opera", default: true },
      { name: "seo", title: "SEO" },
    ],
    fields: [
      {
        ...localized("title", "Titolo"),
        group: "content",
        validation: (r) => r.required(),
      },
      defineField({
        name: "slug",
        title: "Indirizzo della pagina",
        type: "slug",
        group: "content",
        options: {
          source: (doc) =>
            (doc.title as { language: string; value: string }[])?.find(
              (x) => x.language === "it",
            )?.value || "",
          maxLength: 96,
        },
        validation: (r) => r.required(),
      }),
      { ...localized("description", "Descrizione", "Text"), group: "content" },
      defineField({
        name: "body",
        title: "Approfondimento",
        type: "internationalizedArrayBlockContent",
        group: "content",
      }),
      defineField({
        name: "categories",
        title: "Categorie",
        type: "array",
        of: [{ type: "string" }],
        options: { list: categories },
        group: "content",
        validation: (r) => r.required().min(1),
      }),
      defineField({
        name: "mainImage",
        title: "Fotografia principale",
        type: "editorialImage",
        group: "content",
        validation: (r) => r.required(),
      }),
      defineField({
        name: "gallery",
        title: "Altre fotografie",
        type: "array",
        of: [{ type: "editorialImage" }],
        group: "content",
      }),
      defineField({
        name: "sourceArtist",
        title: "Maestro di riferimento",
        description:
          "Per una riproduzione: autore del dipinto di riferimento. L’opera eseguita è di Patrizio.",
        type: "string",
        group: "content",
      }),
      defineField({
        name: "technique",
        title: "Tecnica",
        type: "string",
        group: "content",
      }),
      defineField({
        name: "dimensions",
        title: "Dimensioni",
        type: "string",
        group: "content",
      }),
      defineField({
        name: "beforeImage",
        title: "Originale per il confronto Before/After",
        type: "editorialImage",
        group: "content",
      }),
      defineField({
        name: "beforeCredit",
        title: "Attribuzione dell’originale",
        type: "string",
        group: "content",
      }),
      defineField({
        name: "needsEditorialReview",
        title: "Dati da verificare prima dell’indicizzazione",
        type: "boolean",
        initialValue: false,
        group: "seo",
      }),
      defineField({ name: "seo", type: "seo", group: "seo" }),
      identity,
    ],
    preview,
  }),
  defineType({
    name: "process",
    title: "Lavorazione",
    type: "document",
    fields: [
      localized("title", "Titolo"),
      defineField({
        name: "slug",
        type: "slug",
        title: "Indirizzo",
        validation: (r) => r.required(),
      }),
      localized("description", "Descrizione", "Text"),
      defineField({
        name: "images",
        title: "Fotografie in ordine di lavorazione",
        type: "array",
        of: [{ type: "editorialImage" }],
        validation: (r) => r.required().min(1),
      }),
      defineField({
        name: "artwork",
        title: "Opera collegata",
        type: "reference",
        to: [{ type: "artwork" }],
      }),
      defineField({ name: "seo", type: "seo" }),
      identity,
    ],
    preview: {
      select: { titles: "title", media: "images.0" },
      prepare: preview.prepare,
    },
  }),
  defineType({
    name: "page",
    title: "Pagina",
    type: "document",
    fields: [
      defineField({
        name: "kind",
        title: "Pagina",
        type: "string",
        options: {
          list: [
            { title: "Home", value: "home" },
            { title: "Biografia e CV", value: "about" },
            { title: "Contatti", value: "contact" },
          ],
        },
        validation: (r) => r.required(),
      }),
      defineField({
        name: "language",
        title: "Lingua",
        type: "string",
        options: {
          list: [
            { title: "Italiano", value: "it" },
            { title: "English", value: "en" },
          ],
        },
        validation: (r) => r.required(),
      }),
      defineField({
        name: "title",
        title: "Titolo",
        type: "string",
        validation: (r) => r.required(),
      }),
      defineField({ name: "body", title: "Testo", type: "blockContent" }),
      defineField({
        name: "images",
        title: "Fotografie",
        type: "array",
        of: [{ type: "editorialImage" }],
      }),
      defineField({
        name: "cvPdf",
        title: "CV PDF (facoltativo)",
        type: "file",
        options: { accept: ".pdf" },
      }),
      defineField({ name: "seoTitle", title: "Titolo SEO", type: "string" }),
      defineField({
        name: "seoDescription",
        title: "Descrizione SEO",
        type: "text",
      }),
      identity,
    ],
    preview: { select: { title: "title", subtitle: "language" } },
  }),
  defineType({
    name: "siteSettings",
    title: "Impostazioni del sito",
    type: "document",
    fields: [
      defineField({
        name: "name",
        title: "Nome artista",
        type: "string",
        initialValue: "Patrizio Buonaiuto",
      }),
      defineField({
        name: "email",
        title: "Email pubblica",
        type: "string",
        validation: (r) => r.email(),
      }),
      defineField({
        name: "mobile",
        title: "Cellulare pubblico",
        type: "string",
      }),
      defineField({
        name: "phone",
        title: "Telefono fisso pubblico",
        type: "string",
      }),
      defineField({ name: "facebook", title: "Facebook", type: "url" }),
      defineField({
        name: "featuredArtworks",
        title: "Opere nella sala — in ordine",
        type: "array",
        of: [{ type: "reference", to: [{ type: "artwork" }] }],
        validation: (r) => r.max(5).unique(),
      }),
      defineField({
        name: "comparisonArtwork",
        title: "Opera per Before/After",
        type: "reference",
        to: [{ type: "artwork" }],
      }),
    ],
    preview: { prepare: () => ({ title: "Impostazioni del sito" }) },
  }),
];
