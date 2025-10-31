"use server";

import {
  _InstanceType,
  GetConsoleOutputCommand,
  GetConsoleOutputCommandOutput,
  RunInstancesCommand,
  TerminateInstancesCommand,
} from "@aws-sdk/client-ec2";

import { cloudflare } from "./cloudflare";
import { symmetricEncrypt } from "./encryption";
import { jwtSign } from "./jwt";
import { redis } from "./redis";
import { auth } from "@/auth";
import { revalidateTag, unstable_cache } from "next/cache";

import { ec2 } from "./aws";

// Get all proxy servers
export async function getAllPublicProxyServers(): Promise<
  {
    id: string;
    url: string;
    status: string;
    type: string;
  }[]
> {
  if (process.env.PROXY_PUBLIC_PREFIX === undefined) {
    console.error("getAllPublicProxyServers - PROXY_PUBLIC_PREFIX env not set");
    return [];
  }
  try {
    const searchPatternPrefix = `${process.env.PROXY_PUBLIC_PREFIX}:`;
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
        type: "public",
        ...(values[index] || { status: "unavailable", url: "" }),
      }));
    }
  } catch (error) {
    console.error("Error fetching providers:", error);
  }
  return [];
}

export async function getAllPrivateProxyServers(): Promise<
  {
    id: string;
    url: string;
    status: string;
    type: string;
  }[]
> {
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("getAllPrivateProxyServers - Unauthorized");
    return [];
  }
  const userId = session.user.id;
  if (process.env.PROXY_PRIVATE_PREFIX === undefined) {
    console.error("getAllPrivateProxyServers - env not set");
    return [];
  }
  try {
    const searchPatternPrefix = `${process.env.PROXY_PRIVATE_PREFIX}:${userId}:`;
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
        type: "private",
        ...(values[index] || { status: "unavailable", url: "" }),
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
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("getAllUserAdapters - Unauthorized");
    return [];
  }
  const userId = session.user.id;
  const getCachedAdapters = unstable_cache(
    async (uid: string) => {
      if (process.env.ADAPTER_PREFIX === undefined) {
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
    process.env.PROXY_PUBLIC_PREFIX === undefined ||
    process.env.PROXY_PRIVATE_PREFIX === undefined ||
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
    type ProxyInfo = {
      url: string;
      status: string;
    };
    const pipe = redis.pipeline();
    pipe.get<ProxyInfo>([process.env.PROXY_PUBLIC_PREFIX, pid].join(":"));
    pipe.get<ProxyInfo>(
      [process.env.PROXY_PRIVATE_PREFIX, session.user.id, pid].join(":")
    );
    const [publicCheckResult, privateCheckResult] = await pipe.exec<
      [ProxyInfo | null, ProxyInfo | null]
    >();
    const proxy: ProxyInfo | null = privateCheckResult ?? publicCheckResult;
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
    process.env.PROXY_PUBLIC_PREFIX === undefined ||
    process.env.PROXY_PRIVATE_PREFIX === undefined ||
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

    type ProxyInfo = {
      url: string;
      status: string;
    };
    const pipe = redis.pipeline();
    pipe.get<ProxyInfo>([process.env.PROXY_PUBLIC_PREFIX, pid].join(":"));
    pipe.get<ProxyInfo>(
      [process.env.PROXY_PRIVATE_PREFIX, session.user.id, pid].join(":")
    );
    const [publicCheckResult, privateCheckResult] = await pipe.exec<
      [ProxyInfo | null, ProxyInfo | null]
    >();
    const proxy: ProxyInfo | null = privateCheckResult ?? publicCheckResult;

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
  mppa: number; // max private proxies allowed
  adv: boolean; // pro
}

const DefaultUserPermissions: UserPermissions = {
  maa: 3,
  mppa: 1,
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
  type: string;
}): Promise<{
  url: string;
  status: string;
  id: string;
  isHealthy: boolean;
  responseTime: number | undefined;
  type: string;
  error?: string;
}> {
  let healthUrl = `${proxy.url}/health/liveness`;
  if (!healthUrl.startsWith("https")) {
    healthUrl = `https://${healthUrl}`;
  }
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
      status: "unavailable",
      isHealthy: false,
      responseTime: undefined,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createPrivateProxyInstance(): Promise<
  string | undefined
> {
  if (
    process.env.AWS_IMAGE_ID === undefined ||
    process.env.AWS_IAM_NAME === undefined ||
    process.env.AWS_KEY_NAME === undefined ||
    process.env.AWS_SECURITY_GROUP_ID === undefined ||
    process.env.AWS_INSTANCE_TYPE === undefined ||
    process.env.CLOUDFLARE_TOKEN === undefined ||
    process.env.CLOUDFLARE_ZONE_ID === undefined ||
    process.env.AUTHTOKEN_PREFIX === undefined ||
    process.env.DOMAIN_NAME === undefined ||
    process.env.GITHUB_GATEWAY_REPOSITORY_URL === undefined ||
    process.env.GITHUB_GATEWAY_REPOSITORY_BRANCH === undefined ||
    process.env.GITHUB_GATEWAY_REPOSITORY_NAME === undefined ||
    process.env.SUBDOMAIN_LOCK_PREFIX === undefined ||
    process.env.SUBDOMAIN_INSTANCE_PREFIX === undefined ||
    process.env.PROXY_PRIVATE_PREFIX === undefined
  ) {
    console.error("env not set");
    return undefined;
  }

  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    console.error("Unauthorized");
    return undefined;
  }

  const { token: jwtToken, error } = await jwtSign();
  if (jwtToken === undefined) {
    console.error(error);
    return undefined;
  }

  const token = crypto.randomUUID();
  await redis.set<string>(
    [process.env.AUTHTOKEN_PREFIX, token].join(":"),
    jwtToken,
    { ex: 3600 }
  );

  let randomGatewaySubDomain: string | undefined;

  const maxRetries = 10;
  const baseDelay = 3000;
  const batchSize = 5;
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

  const acquireLock = async (domain: string): Promise<boolean> => {
    const lockKey = [process.env.SUBDOMAIN_LOCK_PREFIX, domain].join(":");
    const lockValue = Date.now().toString();
    const result = await redis.set(lockKey, lockValue, {
      ex: 180,
      nx: true,
    });
    return result !== null;
  };

  const generateRandomDomain = () => {
    const timestamp = Date.now();
    let timePart = "";
    for (let i = 0; i < 4; i++) {
      const index = (timestamp >> (i * 5)) % chars.length;
      timePart += chars[index];
    }
    const randomArray = new Uint32Array(4);
    crypto.getRandomValues(randomArray);
    let randomPart = "";
    for (let i = 0; i < 4; i++) {
      randomPart += chars[randomArray[i] % chars.length];
    }

    return `gtw-${process.env.AWS_REGION}-${timePart + randomPart}.${
      process.env.DOMAIN_NAME
    }`;
  };

  let existingDomains: Set<string> | null = null;
  const checkDomainsBatch = async (domains: string[]): Promise<string[]> => {
    if (!existingDomains) {
      const existingRecords = await cloudflare.dns.records.list({
        zone_id: process.env.CLOUDFLARE_ZONE_ID as string,
        type: "A",
        per_page: 100,
      });
      existingDomains = new Set(
        existingRecords.result.map((record) => record.name)
      );
    }
    return domains.filter((domain) => !existingDomains!.has(domain));
  };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const candidateDomains = Array.from(
      { length: batchSize },
      generateRandomDomain
    );

    const availableDomains = await checkDomainsBatch(candidateDomains);
    for (const domain of availableDomains) {
      const locked = await acquireLock(domain);
      if (locked) {
        randomGatewaySubDomain = domain;
        break;
      }
    }

    if (randomGatewaySubDomain) {
      break;
    }

    if (attempt < maxRetries - 1) {
      const exponentialDelay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 1000;
      const delay = Math.min(exponentialDelay + jitter, 30000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  if (randomGatewaySubDomain === undefined) {
    console.error("Subdomain apply failed");
    return undefined;
  }

  const userDataScript = `#!/bin/bash
set -e

cd /home/ubuntu
git clone -b ${process.env.GITHUB_GATEWAY_REPOSITORY_BRANCH} ${
    process.env.GITHUB_GATEWAY_REPOSITORY_URL
  }
cd ${process.env.GITHUB_GATEWAY_REPOSITORY_NAME}

if [ "$EUID" -ne 0 ]; then     
    # Export all variables and re-run this script as root
    exec sudo -E bash "$0" "$@"
fi

export ADMIN_EMAIL="${session.user?.email || process.env.ADMIN_EMAIL}"
export APP_DOMAIN="${process.env.DOMAIN_NAME}"
export APP_SUBDOMAIN_NAME="${randomGatewaySubDomain}"
export CF_Token="${process.env.CLOUDFLARE_TOKEN}"
export CF_Zone_ID="${process.env.CLOUDFLARE_ZONE_ID}"
export FP_PROXY_SERVER_KEYPAIR_PWD="$(openssl rand -base64 8 | cut -c1-8)"
export FP_APP_TOKEN_PASS="${token}"
export FP_OWNER_USER_ID="${session.user.id}"

chmod +x admin/auto.sh
admin/auto.sh

echo "===============Deployment Success=============="

`;

  const userDataBase64 = Buffer.from(userDataScript).toString("base64");
  const command = new RunInstancesCommand({
    ImageId: process.env.AWS_IMAGE_ID,
    MinCount: 1,
    MaxCount: 1,
    InstanceType: process.env
      .AWS_INSTANCE_TYPE as (typeof _InstanceType)[keyof typeof _InstanceType],
    KeyName: process.env.AWS_KEY_NAME,
    SecurityGroupIds: [process.env.AWS_SECURITY_GROUP_ID],
    TagSpecifications: [
      {
        ResourceType: "instance",
        Tags: [
          {
            Key: "Name",
            Value: randomGatewaySubDomain,
          },
          {
            Key: "CreatedBy",
            Value: process.env.AWS_IAM_NAME,
          },
        ],
      },
    ],
    UserData: userDataBase64,
  });
  try {
    const response = await ec2.send(command);
    if (
      response.Instances !== undefined &&
      response.Instances.length > 0 &&
      response.Instances[0].InstanceId !== undefined
    ) {
      const match = randomGatewaySubDomain.match(/^([^.]*)\..*/);
      const transaction = redis.multi();
      transaction.set<{
        url: string;
        status: string;
      }>(
        [
          process.env.PROXY_PRIVATE_PREFIX,
          session.user.id,
          match ? match[1] : randomGatewaySubDomain,
        ].join(":"),
        { url: randomGatewaySubDomain, status: "unavailable" },
        { ex: 600 }
      );
      transaction.set<string>(
        [
          process.env.SUBDOMAIN_INSTANCE_PREFIX,
          session.user.id,
          randomGatewaySubDomain,
        ].join(":"),
        response.Instances[0].InstanceId
      );
      await transaction.exec();
      return randomGatewaySubDomain;
    }
  } catch (error) {
    console.error(error);
  }
  return undefined;
}

export async function deletePrivateProxyInstance(
  proxyId: string,
  subdomain: string
): Promise<boolean> {
  if (!subdomain || typeof subdomain !== "string") {
    console.error("Invalid subdomain provided");
    return false;
  }
  const { CLOUDFLARE_ZONE_ID, SUBDOMAIN_INSTANCE_PREFIX } = process.env;
  if (!CLOUDFLARE_ZONE_ID || !SUBDOMAIN_INSTANCE_PREFIX) {
    console.error("Required environment variables not set:", {
      CLOUDFLARE_ZONE_ID: !!CLOUDFLARE_ZONE_ID,
      SUBDOMAIN_INSTANCE_PREFIX: !!SUBDOMAIN_INSTANCE_PREFIX,
    });
    return false;
  }

  const session = await auth();
  if (!session?.user?.id) {
    console.error("User not authenticated");
    return false;
  }

  const userId = session.user.id;
  const subdomainInstanceRedisKey = [
    SUBDOMAIN_INSTANCE_PREFIX,
    userId,
    subdomain,
  ].join(":");
  const proxyRedisKey = [
    process.env.PROXY_PRIVATE_PREFIX,
    userId,
    proxyId,
  ].join(":");

  try {
    const instanceId = await redis.get<string>(subdomainInstanceRedisKey);
    if (!instanceId) {
      console.error(`No instance found for subdomain: ${subdomain}`);
      return false;
    }

    const terminateCommand = new TerminateInstancesCommand({
      InstanceIds: [instanceId],
    });

    let terminationSuccess = false;
    try {
      const response = await ec2.send(terminateCommand);
      terminationSuccess =
        response?.TerminatingInstances?.some(
          (instance) => instance.InstanceId === instanceId
        ) ?? false;

      if (!terminationSuccess) {
        console.error(`Failed to terminate instance: ${instanceId}`);
        return false;
      }
    } catch (ec2Error) {
      console.error("EC2 termination error:", {
        instanceId,
        error: ec2Error instanceof Error ? ec2Error.message : ec2Error,
      });
      return false;
    }

    try {
      const records = await cloudflare.dns.records.list({
        zone_id: CLOUDFLARE_ZONE_ID,
        type: "A",
        name: {
          exact: subdomain,
        },
      });

      const cleanupPromises: Promise<unknown>[] = [
        redis.del(subdomainInstanceRedisKey),
        redis.del(proxyRedisKey),
      ];
      if (records.result.length > 0) {
        const dnsDeletePromises = records.result.map((record) =>
          cloudflare.dns.records
            .delete(record.id, {
              zone_id: CLOUDFLARE_ZONE_ID,
            })
            .catch((error) => {
              console.error(`Failed to delete DNS record ${record.id}:`, error);
            })
        );
        cleanupPromises.push(...dnsDeletePromises);
      } else {
        console.warn(`No DNS records found for subdomain: ${subdomain}`);
      }
      await Promise.all(cleanupPromises);
      return true;
    } catch (cleanupError) {
      console.error("Cleanup error (DNS/Redis):", {
        subdomain,
        error:
          cleanupError instanceof Error ? cleanupError.message : cleanupError,
      });
      return false;
    }
  } catch (error) {
    console.error("Unexpected error in deletePrivateProxyInstance:", {
      subdomain,
      userId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

export async function fetchConsoleLogs(
  subdomain: string
): Promise<undefined | { logs: string; timestamp: Date | undefined }> {
  const session = await auth();
  if (!session?.user?.id) {
    return undefined;
  }
  const userId = session.user.id;
  const instanceId: null | string = await redis.get<string>(
    [process.env.SUBDOMAIN_INSTANCE_PREFIX, userId, subdomain].join(":")
  );
  if (instanceId === null) {
    return undefined;
  }
  try {
    const command = new GetConsoleOutputCommand({
      InstanceId: instanceId,
      Latest: true,
    });

    const response = await ec2.send(command);
    if (response.Output) {
      return {
        logs: Buffer.from(response.Output, "base64").toString("utf-8"),
        timestamp: response.Timestamp,
      };
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
  }
}
