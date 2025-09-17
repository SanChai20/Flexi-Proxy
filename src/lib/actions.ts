"use server";

import { jwtSign } from "./jwt";
import { VERIFY_TOKEN_EXPIRE_SECONDS } from "./utils";
import { encrypt } from "./encryption";
import { redis } from "./redis";
import { auth } from "@/auth";

// Get all target providers
export async function getAllTargetProviders(): Promise<
  { id: string; url: string; status: string }[]
> {
  if (process.env.PROVIDER_PREFIX === undefined) {
    console.error("getAllTargetProviders - PROVIDER_PREFIX env not set");
    return [];
  }
  try {
    const searchPatternPrefix = `${process.env.PROVIDER_PREFIX}:`;
    // Scan all keys with the prefix
    let allKeys: string[] = [];
    let cursor = 0;
    do {
      const [newCursor, keys] = await redis.scan(cursor, {
        match: `${searchPatternPrefix}*`,
        count: 100,
      });
      allKeys.push(...keys);
      cursor = Number(newCursor);
    } while (cursor !== 0);
    if (allKeys.length > 0) {
      const ids = allKeys.map((key) => key.replace(searchPatternPrefix, ""));
      const values = await redis.mget<{ url: string; status: string }[]>(
        ...allKeys
      );
      return ids.map((id, index) => ({
        id,
        ...(values[index] || {}),
      }));
    }
  } catch (error) {
    console.error("Error fetching providers:", error);
  }
  return [];
}

// Get all adapters for the authenticated user
export async function getAllUserAdapters(): Promise<
  {
    aid: string;
    tk: string;
    pid: string;
    pul: string;
    not: string;
  }[]
> {
  if (process.env.ADAPTER_PREFIX === undefined) {
    console.error("getAllUserAdapters - ADAPTER_PREFIX env not set");
    return [];
  }
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("getAllUserAdapters - Unauthorized");
    return [];
  }
  try {
    const searchPatternPrefix = `${process.env.ADAPTER_PREFIX}:${session.user.id}:`;

    let allKeys: string[] = [];
    let cursor = 0;
    do {
      const [newCursor, keys] = await redis.scan(cursor, {
        match: `${searchPatternPrefix}*`,
        count: 100,
      });
      allKeys.push(...keys);
      cursor = Number(newCursor);
    } while (cursor !== 0);
    if (allKeys.length > 0) {
      const adapterIds = allKeys.map((key) =>
        key.replace(searchPatternPrefix, "")
      );
      const values = await redis.mget<
        {
          tk: string;
          pid: string;
          pul: string;
          not: string;
        }[]
      >(...allKeys);
      return adapterIds.map((adapterId, index) => ({
        aid: adapterId,
        ...(values[index] || {}),
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching adapters:", error);
    return [];
  }
}

export async function deleteAdapterAction(
  formData: FormData
): Promise<boolean> {
  const adapterId = formData.get("adapterId") as string;
  if (process.env.ADAPTER_PREFIX === undefined) {
    console.error("deleteAdapterAction - ADAPTER_PREFIX env not set");
    return false;
  }
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("deleteAdapterAction - Unauthorized");
    return false;
  }
  try {
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
    }>([process.env.ADAPTER_PREFIX, session.user.id, adapterId].join(":"));
    if (adapterRaw !== null) {
      let transaction = redis.multi();
      transaction.del([process.env.ADAPTER_PREFIX, adapterRaw.tk].join(":"));
      transaction.del(
        [process.env.ADAPTER_PREFIX, session.user.id, adapterId].join(":")
      );
      await transaction.exec();
    }
    return true;
  } catch (error) {
    console.error("Error deleting adapter:", error);
    return false;
  }
}

export async function updateAdapterAction(
  formData: FormData
): Promise<boolean> {
  if (
    process.env.ENCRYPTION_KEY === undefined ||
    process.env.ADAPTER_PREFIX === undefined ||
    process.env.PROVIDER_PREFIX === undefined
  ) {
    console.error("updateAdapterAction - env not set");
    return false;
  }
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("updateAdapterAction - Unauthorized");
    return false;
  }

  try {
    const pid = formData.get("provider") as string;
    const url = formData.get("baseUrl") as string;
    const mid = formData.get("modelId") as string;
    const apiKey = formData.get("apiKey") as string;
    const adapterId = formData.get("adapterId") as string;
    const commentNote: string | null = formData.get("commentNote") as string;
    const not = commentNote !== null ? commentNote : "";
    const encodedKey: { iv: string; encryptedData: string; authTag: string } =
      encrypt(apiKey, process.env.ENCRYPTION_KEY);
    const kiv = encodedKey.iv;
    const ken = encodedKey.encryptedData;
    const kau = encodedKey.authTag;

    const provider: { url: string } | null = await redis.get<{ url: string }>(
      [process.env.PROVIDER_PREFIX, pid].join(":")
    );
    if (provider === null) {
      console.error("updateAdapterAction - Missing provider");
      return false;
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
    }>([process.env.ADAPTER_PREFIX, session.user.id, adapterId].join(":"));

    let tokenKey = ["fp", crypto.randomUUID()].join("-");
    let transaction = redis.multi();
    if (adapterRaw !== null) {
      // Remove old make new
      transaction.del([process.env.ADAPTER_PREFIX, adapterRaw.tk].join(":"));
      transaction.set<{
        tk: string;
        pid: string;
        pul: string;
        not: string;
      }>([process.env.ADAPTER_PREFIX, session.user.id, adapterId].join(":"), {
        tk: tokenKey,
        pid,
        pul: provider.url,
        not,
      });
      transaction.set<{
        uid: string;
        kiv: string;
        ken: string;
        kau: string;
        url: string;
        mid: string;
      }>([process.env.ADAPTER_PREFIX, tokenKey].join(":"), {
        uid: session.user.id,
        kiv,
        ken,
        kau,
        url,
        mid,
      });
    } else {
      transaction.set<{
        tk: string;
        pid: string;
        pul: string;
        not: string;
      }>([process.env.ADAPTER_PREFIX, session.user.id, adapterId].join(":"), {
        tk: tokenKey,
        pid,
        pul: provider.url,
        not,
      });
      transaction.set<{
        uid: string;
        kiv: string;
        ken: string;
        kau: string;
        url: string;
        mid: string;
      }>([process.env.ADAPTER_PREFIX, tokenKey].join(":"), {
        uid: session.user.id,
        kiv,
        ken,
        kau,
        url,
        mid,
      });
    }
    await transaction.exec();
    return true;
  } catch (error) {
    console.error("Error updating adapter:", error);
    return false;
  }
}

export async function createAdapterAction(
  formData: FormData
): Promise<boolean> {
  if (
    process.env.ENCRYPTION_KEY === undefined ||
    process.env.ADAPTER_PREFIX === undefined ||
    process.env.PROVIDER_PREFIX === undefined
  ) {
    console.error("createAdapterAction - env not set");
    return false;
  }
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("createAdapterAction - Unauthorized");
    return false;
  }
  try {
    const pid = formData.get("provider") as string;
    const url = formData.get("baseUrl") as string;
    const mid = formData.get("modelId") as string;
    const apiKey = formData.get("apiKey") as string;
    const commentNote: string | null = formData.get("commentNote") as string;
    const not = commentNote !== null ? commentNote : "";
    const encodedKey: { iv: string; encryptedData: string; authTag: string } =
      encrypt(apiKey, process.env.ENCRYPTION_KEY);
    const kiv = encodedKey.iv;
    const ken = encodedKey.encryptedData;
    const kau = encodedKey.authTag;
    const provider: { url: string } | null = await redis.get<{ url: string }>(
      [process.env.PROVIDER_PREFIX, pid].join(":")
    );
    if (provider === null) {
      console.error("createAdapterAction - Missing provider");
      return false;
    }
    let tokenKey = ["fp", crypto.randomUUID()].join("-");
    let transaction = redis.multi();
    transaction.set<{
      tk: string;
      pid: string;
      pul: string;
      not: string;
    }>(
      [process.env.ADAPTER_PREFIX, session.user.id, crypto.randomUUID()].join(
        ":"
      ),
      {
        tk: tokenKey,
        pid,
        pul: provider.url,
        not,
      }
    );
    transaction.set<{
      uid: string;
      kiv: string;
      ken: string;
      kau: string;
      url: string;
      mid: string;
    }>([process.env.ADAPTER_PREFIX, tokenKey].join(":"), {
      uid: session.user.id,
      kiv,
      ken,
      kau,
      url,
      mid,
    });
    await transaction.exec();
    return true;
  } catch (error) {
    console.error("Error creating adapter:", error);
    return false;
  }
}

export async function getAdapterAction(
  adapterId: string
): Promise<{ url: string; mid: string; pid: string; not: string } | undefined> {
  if (process.env.ADAPTER_PREFIX === undefined) {
    console.error("getAdapterAction - env not set");
    return undefined;
  }
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("getAdapterAction - Unauthorized");
    return undefined;
  }
  try {
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
    }>([process.env.ADAPTER_PREFIX, session.user.id, adapterId].join(":"));
    if (adapterRaw !== null) {
      const adapterTokenData: {
        uid: string;
        kiv: string;
        ken: string;
        kau: string;
        url: string;
        mid: string;
      } | null = await redis.get<{
        uid: string;
        kiv: string;
        ken: string;
        kau: string;
        url: string;
        mid: string;
      }>([process.env.ADAPTER_PREFIX, adapterRaw.tk].join(":"));
      if (adapterTokenData !== null) {
        return {
          url: adapterTokenData.url,
          mid: adapterTokenData.mid,
          pid: adapterRaw.pid,
          not: adapterRaw.not,
        };
      }
    }
    return undefined;
  } catch (error) {
    console.error("Error getting adapter:", error);
    return undefined;
  }
}

export async function getSettingsAction(): Promise<{
  cd: boolean;
}> {
  const session = await auth();
  if (!!(session && session.user && session.user.id)) {
    if (process.env.SETTINGS_PREFIX !== undefined) {
      const settings: any | null = await redis.get(
        [process.env.SETTINGS_PREFIX, session.user.id].join(":")
      );
      if (settings !== null) {
        return settings;
      }
    }
  }
  return { cd: false };
}

export async function updateSettingsAction(
  formData: FormData
): Promise<boolean> {
  if (process.env.SETTINGS_PREFIX === undefined) {
    console.error("updateSettingsAction - env not set");
    return false;
  }
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("updateSettingsAction - Unauthorized");
    return false;
  }
  try {
    const dataCollection = formData.get("dataCollection") === "on";
    const settings: any | null = await redis.get(
      [process.env.SETTINGS_PREFIX, session.user.id].join(":")
    );
    await redis.set<string>(
      [process.env.SETTINGS_PREFIX, session.user.id].join(":"),
      {
        ...(settings !== null ? settings : {}),
        cd: dataCollection,
      }
    );
    return true;
  } catch (error) {
    console.error("Error updating settings:", error);
    return false;
  }
}

export async function getMaxAdapterAllowedPermissionsAction(): Promise<number> {
  const session = await auth();
  if (!!(session && session.user && session.user.id)) {
    if (process.env.PERMISSIONS_PREFIX !== undefined) {
      const permissions: any | null = await redis.get(
        [process.env.PERMISSIONS_PREFIX, session.user.id].join(":")
      );
      if (permissions !== null) {
        return permissions["maa"];
      }
    }
  }
  return 1;
}

export async function updateMaxAdapterAllowedPermissionsAction(
  maxAdaptersAllowed: number
): Promise<boolean> {
  if (process.env.PERMISSIONS_PREFIX === undefined) {
    console.error("updateMaxAdapterAllowedPermissionsAction - env not set");
    return false;
  }
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("updateMaxAdapterAllowedPermissionsAction - Unauthorized");
    return false;
  }
  try {
    const permissions: any | null = await redis.get(
      [process.env.PERMISSIONS_PREFIX, session.user.id].join(":")
    );
    await redis.set<string>(
      [process.env.PERMISSIONS_PREFIX, session.user.id].join(":"),
      {
        ...(permissions !== null ? permissions : {}),
        maa: maxAdaptersAllowed,
      }
    );
    return true;
  } catch (error) {
    console.error("Error getting permissions:", error);
    return false;
  }
}
