import { draftMode } from "next/headers";
export async function GET() {
  (await draftMode()).disable();
  return new Response(null, { status: 303, headers: { Location: "/it" } });
}
