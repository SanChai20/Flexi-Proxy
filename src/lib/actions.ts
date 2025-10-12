"use server";

import { symmetricEncrypt } from "./encryption";
import { redis } from "./redis";
import { auth } from "@/auth";

// Get all proxy servers
export async function getAllProxyServers(): Promise<
  { id: string; url: string; status: string; adv: boolean }[]
> {
  if (process.env.PROXY_PREFIX === undefined) {
    console.error("getAllProxyServers - PROXY_PREFIX env not set");
    return [];
  }
  try {
    const searchPatternPrefix = `${process.env.PROXY_PREFIX}:`;
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
      const values = await redis.mget<
        { url: string; status: string; adv: boolean }[]
      >(...allKeys);
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
    ava: boolean;
  }[]
> {
  if (
    process.env.ADAPTER_PREFIX === undefined ||
    process.env.PROXY_PREFIX === undefined
  ) {
    console.error("getAllUserAdapters - env not set");
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
      const values: {
        tk: string;
        pid: string;
        pul: string;
        not: string;
      }[] = await redis.mget<
        {
          tk: string;
          pid: string;
          pul: string;
          not: string;
        }[]
      >(...allKeys);
      const providerIds: string[] = values.map((item) =>
        [process.env.PROXY_PREFIX, item.pid].join(":")
      );
      const providers: (null | {
        url: string;
        status: string;
        adv: boolean;
      })[] = await redis.mget<{ url: string; status: string; adv: boolean }[]>(
        ...providerIds
      );
      return adapterIds.map((adapterId, index) => ({
        aid: adapterId,
        ava:
          providers[index] !== null &&
          providers[index].status !== "unavailable",
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
  if (
    process.env.ADAPTER_PREFIX === undefined ||
    process.env.ADAPTER_KEY_PREFIX === undefined ||
    process.env.USER_MODIFY_VERSION_PREFIX === undefined
  ) {
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
      transaction.del(
        [
          process.env.ADAPTER_PREFIX,
          process.env.ADAPTER_KEY_PREFIX,
          adapterRaw.tk,
        ].join(":")
      );
      transaction.del([process.env.ADAPTER_PREFIX, adapterRaw.tk].join(":"));
      transaction.del(
        [process.env.ADAPTER_PREFIX, session.user.id, adapterId].join(":")
      );
      transaction.incrby(
        [process.env.USER_MODIFY_VERSION_PREFIX, session.user.id].join(":"),
        1
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
    process.env.ADAPTER_KEY_PREFIX === undefined ||
    process.env.PROXY_PREFIX === undefined ||
    process.env.USER_MODIFY_VERSION_PREFIX === undefined
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
    const pid = formData.get("proxy") as string;
    const pro = formData.get("provider") as string;
    const llm = formData.get("litellmParams") as string;
    const mid = formData.get("modelId") as string;
    const apiKey = formData.get("apiKey") as string;
    const adapterId = formData.get("adapterId") as string;
    const commentNote: string | null = formData.get("commentNote") as string;
    const not = commentNote !== null ? commentNote : "";
    const encodedKey: { iv: string; encryptedData: string; authTag: string } =
      symmetricEncrypt(apiKey, process.env.ENCRYPTION_KEY);
    const kiv = encodedKey.iv;
    const ken = encodedKey.encryptedData;
    const kau = encodedKey.authTag;

    const proxy: { url: string; status: string; adv: boolean } | null =
      await redis.get<{ url: string; status: string; adv: boolean }>(
        [process.env.PROXY_PREFIX, pid].join(":")
      );
    if (proxy === null) {
      console.error("updateAdapterAction - Missing proxy");
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
    transaction.incrby(
      [process.env.USER_MODIFY_VERSION_PREFIX, session.user.id].join(":"),
      1
    );
    if (adapterRaw !== null) {
      // Remove old make new
      transaction.del(
        [
          process.env.ADAPTER_PREFIX,
          process.env.ADAPTER_KEY_PREFIX,
          adapterRaw.tk,
        ].join(":")
      );
      transaction.del([process.env.ADAPTER_PREFIX, adapterRaw.tk].join(":"));
      transaction.set<{
        tk: string;
        pid: string;
        pul: string;
        not: string;
      }>([process.env.ADAPTER_PREFIX, session.user.id, adapterId].join(":"), {
        tk: tokenKey,
        pid,
        pul: proxy.url,
        not,
      });
      transaction.set<{
        uid: string;
        pro: string;
        mid: string;
        llm: string;
      }>([process.env.ADAPTER_PREFIX, tokenKey].join(":"), {
        uid: session.user.id,
        pro,
        mid,
        llm,
      });
      transaction.set<{
        kiv: string;
        ken: string;
        kau: string;
      }>(
        [
          process.env.ADAPTER_PREFIX,
          process.env.ADAPTER_KEY_PREFIX,
          tokenKey,
        ].join(":"),
        { kiv, ken, kau }
      );
    } else {
      transaction.set<{
        tk: string;
        pid: string;
        pul: string;
        not: string;
      }>([process.env.ADAPTER_PREFIX, session.user.id, adapterId].join(":"), {
        tk: tokenKey,
        pid,
        pul: proxy.url,
        not,
      });
      transaction.set<{
        uid: string;
        pro: string;
        mid: string;
        llm: string;
      }>([process.env.ADAPTER_PREFIX, tokenKey].join(":"), {
        uid: session.user.id,
        pro,
        mid,
        llm
      });
      transaction.set<{
        kiv: string;
        ken: string;
        kau: string;
      }>(
        [
          process.env.ADAPTER_PREFIX,
          process.env.ADAPTER_KEY_PREFIX,
          tokenKey,
        ].join(":"),
        { kiv, ken, kau }
      );
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
    process.env.ADAPTER_KEY_PREFIX === undefined ||
    process.env.PROXY_PREFIX === undefined ||
    process.env.USER_MODIFY_VERSION_PREFIX === undefined
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
    const pid = formData.get("proxy") as string;
    const pro = formData.get("provider") as string;
    const llm = formData.get("litellmParams") as string;
    const mid = formData.get("modelId") as string;
    const apiKey = formData.get("apiKey") as string;
    const commentNote: string | null = formData.get("commentNote") as string;
    const not = commentNote !== null ? commentNote : "";
    const encodedKey: { iv: string; encryptedData: string; authTag: string } =
      symmetricEncrypt(apiKey, process.env.ENCRYPTION_KEY);
    const kiv = encodedKey.iv;
    const ken = encodedKey.encryptedData;
    const kau = encodedKey.authTag;
    const proxy: { url: string; status: string; adv: boolean } | null =
      await redis.get<{ url: string; status: string; adv: boolean }>(
        [process.env.PROXY_PREFIX, pid].join(":")
      );
    if (proxy === null) {
      console.error("createAdapterAction - Missing proxy");
      return false;
    }
    let tokenKey = ["fp", crypto.randomUUID()].join("-");
    let transaction = redis.multi();
    transaction.incrby(
      [process.env.USER_MODIFY_VERSION_PREFIX, session.user.id].join(":"),
      1
    );
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
        pul: proxy.url,
        not,
      }
    );
    transaction.set<{
      uid: string;
      pro: string;
      mid: string;
      llm: string;
    }>([process.env.ADAPTER_PREFIX, tokenKey].join(":"), {
      uid: session.user.id,
      pro,
      mid,
      llm
    });
    transaction.set<{
      kiv: string;
      ken: string;
      kau: string;
    }>(
      [
        process.env.ADAPTER_PREFIX,
        process.env.ADAPTER_KEY_PREFIX,
        tokenKey,
      ].join(":"),
      {
        kiv,
        ken,
        kau,
      }
    );
    await transaction.exec();
    return true;
  } catch (error) {
    console.error("Error creating adapter:", error);
    return false;
  }
}

export async function getAdapterAction(
  adapterId: string
): Promise<{ pro: string; mid: string; pid: string; not: string; llm: string } | undefined> {
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
        pro: string;
        mid: string;
        llm: string;
      } | null = await redis.get<{
        uid: string;
        pro: string;
        mid: string;
        llm: string;
      }>([process.env.ADAPTER_PREFIX, adapterRaw.tk].join(":"));
      if (adapterTokenData !== null) {
        return {
          pro: adapterTokenData.pro,
          mid: adapterTokenData.mid,
          pid: adapterRaw.pid,
          not: adapterRaw.not,
          llm: adapterTokenData.llm,
        };
      }
    }
    return undefined;
  } catch (error) {
    console.error("Error getting adapter:", error);
    return undefined;
  }
}

export async function getUserAdapterModifyVersion(): Promise<
  number | undefined
> {
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    return undefined;
  }
  if (process.env.USER_MODIFY_VERSION_PREFIX === undefined) {
    console.error("getUserAdapterModifyVersion - env not set");
    return undefined;
  }
  try {
    const versionNumber = await redis.get<number>(
      [process.env.USER_MODIFY_VERSION_PREFIX, session.user.id].join(":")
    );
    if (versionNumber !== null) {
      return versionNumber;
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Error incrementing version:", error);
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
      if (permissions !== null && typeof permissions["maa"] === "number") {
        return permissions["maa"];
      }
    }
  }
  return 3;
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
    await redis.set(
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

export async function getAdvProviderRequestPermissionsAction(): Promise<boolean> {
  const session = await auth();
  if (!!(session && session.user && session.user.id)) {
    if (process.env.PERMISSIONS_PREFIX !== undefined) {
      const permissions: any | null = await redis.get(
        [process.env.PERMISSIONS_PREFIX, session.user.id].join(":")
      );
      if (permissions !== null && typeof permissions["adv"] === "boolean") {
        return permissions["adv"];
      }
    }
  }
  return false;
}

export async function updateAdvProviderRequestPermissionsAction(
  advProviderRequest: boolean
): Promise<boolean> {
  if (process.env.PERMISSIONS_PREFIX === undefined) {
    console.error("updateAdvProviderRequestPermissionsAction - env not set");
    return false;
  }
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("updateAdvProviderRequestPermissionsAction - Unauthorized");
    return false;
  }
  try {
    const permissions: any | null = await redis.get(
      [process.env.PERMISSIONS_PREFIX, session.user.id].join(":")
    );
    await redis.set(
      [process.env.PERMISSIONS_PREFIX, session.user.id].join(":"),
      {
        ...(permissions !== null ? permissions : {}),
        adv: advProviderRequest,
      }
    );
    return true;
  } catch (error) {
    console.error("Error getting permissions:", error);
    return false;
  }
}

export async function createShortTimeToken(expiresIn: number): Promise<string> {
  const token = crypto.randomUUID();
  await redis.set(
    [process.env.AUTHTOKEN_PREFIX, "tp", token].join(":"),
    token,
    { ex: expiresIn }
  );
  return token;
}

export async function verifyShortTimeToken(token: string): Promise<boolean> {
  const ttl: number = await redis.ttl(
    [process.env.AUTHTOKEN_PREFIX, "tp", token].join(":")
  );
  return ttl > 0;
}
