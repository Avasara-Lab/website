import { guard, jsonError } from "@/server/http";
import { refreshIntelligence } from "@/server/modules/intelligence/service";

export async function POST(request: Request) {
  try {
    const context = await guard(request, "write");
    const result = await refreshIntelligence(context.db, context.organizationId, new Date());
    return Response.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
