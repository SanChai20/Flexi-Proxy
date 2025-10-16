import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";
import { AuthRequest, withAuth } from "@/lib/with-auth";
import { revalidateTag } from "next/cache";

const ENV = {
  PROXY_MODELS_PREFIX: process.env.PROXY_MODELS_PREFIX!,
} as const;

interface ModelsByProvider {
  [provider: string]: string[];
}

interface RegistryRequestBody {
  models_by_provider: ModelsByProvider;
}

const RedisKeys = {
  proxyModels: (proxyId: string) => `${ENV.PROXY_MODELS_PREFIX}:${proxyId}`,
} as const;

const CacheTags = {
  serverModels: (proxyId: string) => `server-models:${proxyId}`,
} as const;

function validateRequestBody(data: unknown): data is RegistryRequestBody {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;

  if (!d.models_by_provider || typeof d.models_by_provider !== "object") {
    return false;
  }

  const models = d.models_by_provider as Record<string, unknown>;

  return Object.values(models).every(
    (value) =>
      Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function validateProxyId(proxyId: string): boolean {
  return (
    typeof proxyId === "string" && proxyId.length > 0 && proxyId.length < 100
  );
}

// POST
// API: '/api/{proxyId}/registry'
// Headers: Authorization Bearer <Token>
// Body: {
//  [string] provider A -> models set
//}
async function protectedPOST(
  req: AuthRequest,
  { params }: { params: Promise<{ proxyId: string }> }
) {
  try {
    const [{ proxyId }, body] = await Promise.all([params, req.json()]);

    if (!validateProxyId(proxyId)) {
      return NextResponse.json({ error: "Invalid proxy ID" }, { status: 400 });
    }

    if (!validateRequestBody(body)) {
      return NextResponse.json(
        { error: "Invalid request body. Expected models_by_provider object" },
        { status: 400 }
      );
    }

    const { models_by_provider } = body;

    await redis.set<ModelsByProvider>(
      RedisKeys.proxyModels(proxyId),
      models_by_provider
    );

    Promise.resolve().then(() =>
      revalidateTag(CacheTags.serverModels(proxyId))
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to registry models:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const POST = withAuth(protectedPOST);
