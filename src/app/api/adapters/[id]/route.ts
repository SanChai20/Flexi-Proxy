import { redis } from "@/lib/redis";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";

// POST
// API: '/api/adapters/[id]'
// Headers: Authorization Bearer Token(uid)
// Body: {
//    [string] pid -> provider id
//    [string] url -> base url
//    [string] mid -> model id
//    [string] not -> notes
//    [string] kiv -> iv
//    [string] ken -> encryptedData
//    [string] kau -> authTag
// }
async function protectedPOST(req: PayloadRequest, { params }: { params: Promise<{ id: string }> }) {
  // Create Adapter
  if (!process.env.ADAPTER_PREFIX || !process.env.PROVIDER_PREFIX) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const adapterId = (await params).id;
    if (!req.payload || typeof req.payload["uid"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const { pid, url, mid, not, kiv, ken, kau } = await req.json();
    if (
      typeof pid !== 'string' ||
      typeof url !== 'string' ||
      typeof mid !== 'string' ||
      typeof not !== 'string' ||
      typeof kiv !== 'string' ||
      typeof ken !== 'string' ||
      typeof kau !== 'string') {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const provider: { url: string } | null = await redis.get<{ url: string }>(
      [process.env.PROVIDER_PREFIX, pid].join(":")
    );
    if (!provider) {
      return NextResponse.json({ error: "Missing provider" }, { status: 400 });
    }
    let tokenKey = ["fp", crypto.randomUUID()].join("-");
    let transaction = redis.multi();
    transaction.set<{
      tk: string;
      pid: string;
      pul: string;
      not: string;
    }>([process.env.ADAPTER_PREFIX, req.payload["uid"], adapterId].join(":"), {
      tk: tokenKey,
      pid,
      pul: provider.url,
      not
    })
    transaction.set<{
      uid: string;
      kiv: string;
      ken: string;
      kau: string;
      url: string;
      mid: string;
    }>([process.env.ADAPTER_PREFIX, tokenKey].join(":"), {
      uid: req.payload["uid"],
      kiv,
      ken,
      kau,
      url,
      mid
    });
    await transaction.exec();
    return NextResponse.json(undefined, { status: 200 });
  } catch (error) {
    console.error("Failed to create adapter: ", error);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}


// PATCH
// API: '/api/adapters/[id]'
// Headers: Authorization Bearer Token(uid)
// Body: {
//    [string] pid -> provider id
//    [string] url -> base url
//    [string] mid -> model id
//    [string] not -> notes
//    [string] kiv -> iv
//    [string] ken -> encryptedData
//    [string] kau -> authTag
// }
async function protectedPATCH(req: PayloadRequest, { params }: { params: Promise<{ id: string }> }) {
  // Update Adapter
  if (!process.env.ADAPTER_PREFIX || !process.env.PROVIDER_PREFIX) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }

  try {
    const adapterId = (await params).id;
    if (!req.payload || typeof req.payload["uid"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const { pid, url, mid, not, kiv, ken, kau } = await req.json();
    if (
      typeof pid !== 'string' ||
      typeof url !== 'string' ||
      typeof mid !== 'string' ||
      typeof not !== 'string' ||
      typeof kiv !== 'string' ||
      typeof ken !== 'string' ||
      typeof kau !== 'string') {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const provider: { url: string } | null = await redis.get<{ url: string }>(
      [process.env.PROVIDER_PREFIX, pid].join(":")
    );
    if (!provider) {
      return NextResponse.json({ error: "Missing provider" }, { status: 400 });
    }
    const adapterRaw: {
      tk: string;
      pid: string;
      pul: string;
      not: string;
    } | null = await redis.get<{
      tk: string;
      pid: string;
      pul: string;
      not: string;
    }>([process.env.ADAPTER_PREFIX, req.payload["uid"], adapterId].join(":"))

    let tokenKey = ["fp", crypto.randomUUID()].join("-");
    let transaction = redis.multi();
    if (adapterRaw !== null) {
      // Remove old make new
      transaction.del([process.env.ADAPTER_PREFIX, adapterRaw.tk].join(":"))
      transaction.set<{
        tk: string;
        pid: string;
        pul: string;
        not: string;
      }>([process.env.ADAPTER_PREFIX, req.payload["uid"], adapterId].join(":"), {
        tk: tokenKey,
        pid,
        pul: provider.url,
        not
      })
      transaction.set<{
        uid: string;
        kiv: string;
        ken: string;
        kau: string;
        url: string;
        mid: string;
      }>([process.env.ADAPTER_PREFIX, tokenKey].join(":"), {
        uid: req.payload["uid"],
        kiv,
        ken,
        kau,
        url,
        mid
      })

    } else {
      transaction.set<{
        tk: string;
        pid: string;
        pul: string;
        not: string;
      }>([process.env.ADAPTER_PREFIX, req.payload["uid"], adapterId].join(":"), {
        tk: tokenKey,
        pid,
        pul: provider.url,
        not
      })
      transaction.set<{
        uid: string;
        kiv: string;
        ken: string;
        kau: string;
        url: string;
        mid: string;
      }>([process.env.ADAPTER_PREFIX, tokenKey].join(":"), {
        uid: req.payload["uid"],
        kiv,
        ken,
        kau,
        url,
        mid
      });
    }
    await transaction.exec();
    return NextResponse.json(undefined, { status: 200 });
  } catch (error) {
    console.error("Failed to update adapter: ", error);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}

// DELETE
// API: '/api/adapters/[id]'
// Headers: Authorization Bearer Token(uid)
async function protectedDELETE(req: PayloadRequest, { params }: { params: Promise<{ id: string }> }) {
  // Delete Adapter
  if (!process.env.ADAPTER_PREFIX) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const adapterId = (await params).id;
    if (!req.payload || typeof req.payload["uid"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const adapterRaw: {
      tk: string;
      pid: string;
      pul: string;
      not: string;
    } | null = await redis.get<{
      tk: string;
      pid: string;
      pul: string;
      not: string;
    }>([process.env.ADAPTER_PREFIX, req.payload["uid"], adapterId].join(":"))
    if (adapterRaw !== null) {
      let transaction = redis.multi();
      transaction.del([process.env.ADAPTER_PREFIX, adapterRaw.tk].join(":"))
      transaction.del([process.env.ADAPTER_PREFIX, req.payload["uid"], adapterId].join(":"))
      await transaction.exec();
    }
    return NextResponse.json(undefined, { status: 200 });
  } catch (error) {
    console.error("Failed to delete adapter: ", error);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}

// GET
// API: '/api/adapters/[id]'
// Headers: Authorization Bearer Token(uid)
async function protectedGET(req: PayloadRequest, { params }: { params: Promise<{ id: string }> }) {
  // Get Adapter
  if (!process.env.ADAPTER_PREFIX) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const adapterId = (await params).id;
    if (!req.payload || typeof req.payload["uid"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const adapterRaw: {
      tk: string;
      pid: string;
      pul: string;
      not: string;
    } | null = await redis.get<{
      tk: string;
      pid: string;
      pul: string;
      not: string;
    }>([process.env.ADAPTER_PREFIX, req.payload["uid"], adapterId].join(":"))
    if (adapterRaw !== null) {
      return NextResponse.json(adapterRaw, { status: 200 });
    } else {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to delete adapter: ", error);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(protectedGET);
export const POST = withAuth(protectedPOST);
export const PATCH = withAuth(protectedPATCH);
export const DELETE = withAuth(protectedDELETE);
