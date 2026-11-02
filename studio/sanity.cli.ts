import { defineCliConfig } from "sanity/cli";
export default defineCliConfig({
  api: { projectId: "abnzzs23", dataset: "production" },
  deployment: { appId: "ufulwuadqiw3p8iupky5e55x" },
  typegen: {
    path: "../web/src/**/*.{ts,tsx}",
    schema: "schema.json",
    generates: "../web/src/lib/sanity.types.ts",
    overloadClientMethods: true,
  },
});
