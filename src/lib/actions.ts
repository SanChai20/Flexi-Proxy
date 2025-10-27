"use server";

import { symmetricEncrypt } from "./encryption";
import { redis } from "./redis";
import { auth } from "@/auth";
import { revalidateTag, unstable_cache } from "next/cache";

// Get all proxy servers
export const getAllPublicProxyServers = unstable_cache(
  async () => {
    if (process.env.PROXY_PREFIX === undefined) {
      console.error("getAllProxyServers - PROXY_PREFIX env not set");
      return [];
    }
    try {
      const searchPatternPrefix = `${process.env.PROXY_PREFIX}:`;
      // Scan all keys with the prefix
      let allKeys: string[] = [];
      let cursor = 0;
      let iterations = 0;
      const MAX_ITERATIONS = 100; // Prevent infinite loops
      do {
        if (iterations++ > MAX_ITERATIONS) {
          console.error("SCAN exceeded max iterations");
          break;
        }
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
  },
  ["public-proxy-servers"],
  { revalidate: 600, tags: ["public-proxy-servers"] }
);

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
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("getAllUserAdapters - Unauthorized");
    return [];
  }
  const userId = session.user.id;
  const getCachedAdapters = unstable_cache(
    async (uid: string) => {
      if (
        process.env.ADAPTER_PREFIX === undefined ||
        process.env.PROXY_PREFIX === undefined
      ) {
        console.error("getAllUserAdapters - env not set");
        return [];
      }
      try {
        const searchPatternPrefix = `${process.env.ADAPTER_PREFIX}:${uid}:`;

        let allKeys: string[] = [];
        let cursor = 0;
        let iterations = 0;
        const MAX_ITERATIONS = 100; // Prevent infinite loops
        do {
          if (iterations++ > MAX_ITERATIONS) {
            console.error("SCAN exceeded max iterations");
            break;
          }
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
          })[] = await redis.mget<{ url: string; status: string }[]>(
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
    },
    ["user-adapters"],
    { revalidate: 300, tags: [`user-adapters:${userId}`] }
  );
  return getCachedAdapters(userId);
}

// Get the count of adapters for the authenticated user
export async function getUserAdaptersCount(): Promise<number> {
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("getUserAdaptersCount - Unauthorized");
    return 0;
  }
  const userId = session.user.id;

  const getCachedCount = unstable_cache(
    async (uid: string) => {
      if (process.env.ADAPTER_PREFIX === undefined) {
        console.error("getUserAdaptersCount - env not set");
        return 0;
      }
      try {
        const searchPatternPrefix = `${process.env.ADAPTER_PREFIX}:${uid}:`;

        let count = 0;
        let cursor = 0;
        let iterations = 0;
        const MAX_ITERATIONS = 100;

        do {
          if (iterations++ > MAX_ITERATIONS) {
            console.error("SCAN exceeded max iterations");
            break;
          }
          const [newCursor, keys] = await redis.scan(cursor, {
            match: `${searchPatternPrefix}*`,
            count: 100,
          });
          count += keys.length;
          cursor = Number(newCursor);
        } while (cursor !== 0);

        return count;
      } catch (error) {
        console.error("Error counting adapters:", error);
        return 0;
      }
    },
    ["user-adapters-count"],
    { revalidate: 300, tags: [`user-adapters:${userId}`] }
  );

  return getCachedCount(userId);
}

export async function deleteAdapterAction(
  formData: FormData
): Promise<boolean> {
  const adapterId = formData.get("adapterId") as string;
  if (
    process.env.ADAPTER_PREFIX === undefined ||
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
        [process.env.ADAPTER_PREFIX, adapterRaw.pid, adapterRaw.tk].join(":")
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
    revalidateTag(`user-adapters:${session.user.id}`);
    revalidateTag(`user-adapter:${session.user.id}:${adapterId}`);
    revalidateTag(`user-adapter-version:${session.user.id}`);
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
    const proxy: { url: string; status: string } | null = await redis.get<{
      url: string;
      status: string;
    }>([process.env.PROXY_PREFIX, pid].join(":"));
    if (proxy === null) {
      console.error("updateAdapterAction - Missing proxy");
      return false;
    }

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
        [process.env.ADAPTER_PREFIX, adapterRaw.pid, adapterRaw.tk].join(":")
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
      }>([process.env.ADAPTER_PREFIX, pid, tokenKey].join(":"), {
        kiv,
        ken,
        kau,
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
      }>([process.env.ADAPTER_PREFIX, pid, tokenKey].join(":"), {
        kiv,
        ken,
        kau,
      });
    }
    await transaction.exec();
    revalidateTag(`user-adapters:${session.user.id}`);
    revalidateTag(`user-adapter:${session.user.id}:${adapterId}`);
    revalidateTag(`user-adapter-version:${session.user.id}`);
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
    const proxy: { url: string; status: string } | null = await redis.get<{
      url: string;
      status: string;
    }>([process.env.PROXY_PREFIX, pid].join(":"));
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
      llm,
    });
    transaction.set<{
      kiv: string;
      ken: string;
      kau: string;
    }>([process.env.ADAPTER_PREFIX, pid, tokenKey].join(":"), {
      kiv,
      ken,
      kau,
    });
    await transaction.exec();
    revalidateTag(`user-adapters:${session.user.id}`);
    revalidateTag(`user-adapter-version:${session.user.id}`);
    return true;
  } catch (error) {
    console.error("Error creating adapter:", error);
    return false;
  }
}

export async function getAdapterAction(
  adapterId: string
): Promise<
  | { pro: string; mid: string; pid: string; not: string; llm: string }
  | undefined
> {
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("getAdapterAction - Unauthorized");
    return undefined;
  }
  const userId = session.user.id;
  const getCachedAdapter = unstable_cache(
    async (uid: string, aid: string) => {
      if (process.env.ADAPTER_PREFIX === undefined) {
        console.error("getAdapterAction - env not set");
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
        }>([process.env.ADAPTER_PREFIX, uid, aid].join(":"));
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
    },
    ["user-adapter"],
    { revalidate: 300, tags: [`user-adapter:${userId}:${adapterId}`] }
  );
  return getCachedAdapter(userId, adapterId);
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

interface UserSettings {
  cd: boolean; // collect data?
}

const DefaultUserSettings: UserSettings = {
  cd: false,
};

export async function getSettingsAction(): Promise<UserSettings> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { cd: false };

  const getCached = unstable_cache(
    async (uid: string) => {
      if (process.env.SETTINGS_PREFIX !== undefined) {
        const settings: any | null = await redis.get<UserSettings>(
          [process.env.SETTINGS_PREFIX, uid].join(":")
        );
        if (settings !== null) {
          return settings;
        }
      }
      return DefaultUserSettings;
    },
    ["user-settings"],
    { revalidate: 600, tags: [`user-settings:${userId}`] }
  );
  return getCached(userId);
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
    revalidateTag(`user-settings:${session.user.id}`);
    return true;
  } catch (error) {
    console.error("Error updating settings:", error);
    return false;
  }
}

interface UserPermissions {
  maa: number; // max adapters allowed
  adv: boolean; // pro
}

const DefaultUserPermissions: UserPermissions = {
  maa: 3,
  adv: false,
};

export async function getCachedUserPermissions(): Promise<UserPermissions> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return DefaultUserPermissions;

  const getCached = unstable_cache(
    async (uid: string) => {
      if (!process.env.PERMISSIONS_PREFIX) return DefaultUserPermissions;

      const permissions = await redis.get<UserPermissions>(
        `${process.env.PERMISSIONS_PREFIX}:${uid}`
      );
      if (permissions !== null) {
        return permissions;
      } else {
        return DefaultUserPermissions;
      }
    },
    ["user-permissions"],
    {
      tags: [`user-permissions:${userId}`],
      revalidate: 300,
    }
  );

  return getCached(userId);
}

export async function updateUserPermissions(
  updates: Partial<UserPermissions>
): Promise<boolean> {
  if (!process.env.PERMISSIONS_PREFIX) {
    console.error("PERMISSIONS_PREFIX not set");
    return false;
  }
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return false;
  try {
    const key = `${process.env.PERMISSIONS_PREFIX}:${userId}`;
    const current = await redis.get<UserPermissions>(key);

    await redis.set(key, {
      ...(current ?? {}),
      ...updates,
    });

    revalidateTag(`user-permissions:${userId}`);

    return true;
  } catch (error) {
    console.error("Error updating permissions:", error);
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

export async function getProxyServerModels(
  proxyId: string
): Promise<{ [key: string]: string[] } | null> {
  const getCachedProxyServerModels = unstable_cache(
    async (pid: string) => {
      if (process.env.PROXY_MODELS_PREFIX === undefined) {
        console.error("getProxyServerModels - env not set");
        return null;
      }
      try {
        return await redis.get<{ [key: string]: string[] }>(
          [process.env.PROXY_MODELS_PREFIX, pid].join(":")
        );
      } catch (error) {
        console.error("Error getting models:", error);
        return null;
      }
    },
    ["server-models"],
    { revalidate: 600, tags: [`server-models:${proxyId}`] }
  );
  return getCachedProxyServerModels(proxyId);
}

export async function checkProxyServerHealth(proxy: {
  url: string;
  status: string;
  id: string;
}): Promise<{
  url: string;
  status: string;
  id: string;
  isHealthy: boolean;
  responseTime: number | undefined;
  error?: string;
}> {
  const healthUrl = `${proxy.url}/health/liveness`;
  const startTime = Date.now();
  try {
    const response = await fetch(healthUrl, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5秒超时
      cache: "no-store",
    });
    const responseTime = Date.now() - startTime;
    return {
      ...proxy,
      isHealthy: response.ok,
      responseTime: response.ok ? responseTime : undefined,
    };
  } catch (error) {
    return {
      ...proxy,
      isHealthy: false,
      responseTime: undefined,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
