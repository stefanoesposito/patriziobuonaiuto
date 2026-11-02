import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { internationalizedArray } from "sanity-plugin-internationalized-array";
import { schemaTypes } from "./schemaTypes";
export default defineConfig({
  name: "patrizio",
  title: "Patrizio Buonaiuto",
  projectId: "abnzzs23",
  dataset: "production",
  plugins: [
    internationalizedArray({
      languages: [
        { id: "it", title: "Italiano" },
        { id: "en", title: "English" },
      ],
      defaultLanguages: ["it"],
      fieldTypes: ["string", "text", "blockContent"],
    }),
    structureTool({
      structure: (S) =>
        S.list()
          .title("Atelier")
          .items([
            S.listItem()
              .title("Opere")
              .child(S.documentTypeList("artwork").title("Opere")),
            S.listItem()
              .title("Fasi di lavorazione")
              .child(S.documentTypeList("process").title("Lavorazioni")),
            S.listItem()
              .title("Pagine e biografia / CV")
              .child(
                S.list()
                  .title("Pagine")
                  .items(
                    ["it", "en"].flatMap((language) =>
                      ["home", "about", "contact"].map((kind) =>
                        S.listItem()
                          .title(
                            `${{ home: "Home", about: "Biografia e CV", contact: "Contatti" }[kind]} · ${language.toUpperCase()}`,
                          )
                          .child(
                            S.document()
                              .schemaType("page")
                              .documentId(`${kind}-${language}`),
                          ),
                      ),
                    ),
                  ),
              ),
            S.listItem()
              .title("Contatti e selezioni home")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings"),
              ),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (prev) =>
      prev.filter((x) => !["page", "siteSettings"].includes(x.templateId)),
  },
});
