import { redis } from "@/lib/database";
import { NextResponse } from "next/server";
import { PayloadRequest, withAuth } from "@/lib/with-auth";

export const REGISTERED_PROVIDERS_KEY = "registered:target:providers";
export const REGISTERED_PROVIDER_PREFIX = "registered:target:provider";

async function protectedGET(req: PayloadRequest) {
  const ids: string[] = await redis.lrange<string>(
    REGISTERED_PROVIDERS_KEY,
    0,
    -1
  );

  let pp = redis.pipeline();
  ids.forEach((id) => {
    pp.get<string>([REGISTERED_PROVIDER_PREFIX, id].join(":"));
  });

  const results: { id: string; name: string; url: string }[] = (await pp.exec())
    .map((result: unknown, index: number) => {
      const [error, data] = result as [Error | null, string];
      const id = ids[index];
      if (error || !data || !id) return null;
      try {
        const parsedData = JSON.parse(data);
        return {
          id: id,
          name: parsedData.name,
          url: parsedData.url,
        };
      } catch (parseError) {
        console.error("JSON 解析错误:", parseError);
        return null;
      }
    })
    .filter((result) => result !== null);
  return NextResponse.json(results);
}

export const GET = withAuth(protectedGET);
