import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/lib/content";
export async function GET(request: Request) {
  if (!process.env.SANITY_API_READ_TOKEN)
    return new Response("Draft preview is not configured.", { status: 503 });
  return defineEnableDraftMode({
    client: client.withConfig({
      token: process.env.SANITY_API_READ_TOKEN,
      useCdn: false,
    }),
  }).GET(request);
}
