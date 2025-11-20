"use server";

import {
  _InstanceType,
  GetConsoleOutputCommand,
  GetConsoleOutputCommandOutput,
  RunInstancesCommand,
  TerminateInstancesCommand,
} from "@aws-sdk/client-ec2";

import { cloudflare } from "./cloudflare";
import { jwtSign } from "./jwt";
import { redis } from "./redis";
import { auth } from "@/auth";
import { revalidateTag, unstable_cache } from "next/cache";
import { ec2 } from "./aws";
import { paddle } from "./paddle";
import { Subscription } from "@paddle/paddle-node-sdk";

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

// Get all available models
export async function getAllModels(): Promise<
  {
    id: string;
    name: string;
    description?: string | null;
    pricing: {
      prompt: number | string;
      completion: number | string;
    };
  }[]
> {
  if (
    process.env.OPENROUTER_API_KEY === undefined ||
    process.env.OPENROUTER_MODELS_URL === undefined
  ) {
    console.error("env not set.");
    return [];
  }

  try {
    const headers = {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    };

    const response = await fetch(process.env.OPENROUTER_MODELS_URL, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: { data: any[] } = await response.json();
    const pureTextLLMs = data.data.filter((model) => {
      const arch = model.architecture;
      return (
        arch.input_modalities.includes("text") &&
        arch.output_modalities.includes("text") &&
        !arch.input_modalities.includes("image") &&
        !arch.input_modalities.includes("audio") &&
        !arch.input_modalities.includes("video") &&
        !arch.output_modalities.includes("image") &&
        !arch.output_modalities.includes("embeddings")
      );
    });

    const mappedModels: {
      id: string;
      name: string;
      description?: string | null;
      pricing: {
        prompt: number | string;
        completion: number | string;
      };
    }[] = (pureTextLLMs || []).map((model: any) => ({
      id: model.id,
      name: model.name,
      description: model.description || "",
      pricing: {
        prompt: model.pricing.prompt,
        completion: model.pricing.completion,
      },
    }));

    return mappedModels;
  } catch (error) {
    console.error;
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

    const mid = formData.get("modelId") as string;
    const adapterId = formData.get("adapterId") as string;
    const commentNote: string | null = formData.get("commentNote") as string;
    const not = commentNote !== null ? commentNote : "";

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

    let tokenKey = ["sk", crypto.randomUUID()].join("-");
    let transaction = redis.multi();
    transaction.incrby(
      [process.env.USER_MODIFY_VERSION_PREFIX, session.user.id].join(":"),
      1
    );
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
        pul: proxy.url,
        not,
      });
      transaction.set<{
        uid: string;
        mid: string;
      }>([process.env.ADAPTER_PREFIX, tokenKey].join(":"), {
        uid: session.user.id,
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
        pul: proxy.url,
        not,
      });
      transaction.set<{
        uid: string;
        mid: string;
      }>([process.env.ADAPTER_PREFIX, tokenKey].join(":"), {
        uid: session.user.id,
        mid,
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
    const mid = formData.get("modelId") as string;
    const commentNote: string | null = formData.get("commentNote") as string;
    const not = commentNote !== null ? commentNote : "";

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
    let tokenKey = ["sk", crypto.randomUUID()].join("-");
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
      mid: string;
    }>([process.env.ADAPTER_PREFIX, tokenKey].join(":"), {
      uid: session.user.id,
      mid,
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
): Promise<{ mid: string; pid: string; not: string } | undefined> {
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
            mid: string;
          } | null = await redis.get<{
            uid: string;
            mid: string;
          }>([process.env.ADAPTER_PREFIX, adapterRaw.tk].join(":"));
          if (adapterTokenData !== null) {
            return {
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
  maa: 10,
  mppa: 0,
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

export async function checkUserLoggedIn(): Promise<boolean> {
  const session = await auth();
  return !!(session && session.user && session.user.id);
}

export async function updateUserPermissions(
  userId: string,
  updates: Partial<UserPermissions>
): Promise<boolean> {
  if (!process.env.PERMISSIONS_PREFIX) {
    console.error("PERMISSIONS_PREFIX not set");
    return false;
  }
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
    process.env.AWS_IAM_INSTANCE_PROFILE === undefined ||
    process.env.CLOUDFLARE_TOKEN === undefined ||
    process.env.CLOUDFLARE_ZONE_ID === undefined ||
    process.env.AUTHTOKEN_PREFIX === undefined ||
    process.env.DOMAIN_NAME === undefined ||
    process.env.GITHUB_GATEWAY_REPOSITORY_URL === undefined ||
    process.env.GITHUB_GATEWAY_REPOSITORY_BRANCH === undefined ||
    process.env.GITHUB_GATEWAY_REPOSITORY_NAME === undefined ||
    process.env.SUBDOMAIN_LOCK_PREFIX === undefined ||
    process.env.SUBDOMAIN_INSTANCE_PREFIX === undefined ||
    process.env.PROXY_PRIVATE_PREFIX === undefined ||
    process.env.SSM_PARAMETER_PREFIX === undefined
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
    const uuid = crypto.randomUUID().replace(/-/g, "");
    const randomStr = uuid.substring(0, 8).toLowerCase();
    return `gtw-${process.env.AWS_REGION}-${randomStr}.${process.env.DOMAIN_NAME}`;
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

LOG_FILE="/tmp/deployment.log"
exec > >(tee -a $LOG_FILE)
exec 2>&1

echo "========== Deployment Started at $(date) =========="

# ========================================
# Step 1: Install AWS CLI if not present
# ========================================
if ! command -v aws &> /dev/null; then
    echo "AWS CLI not found. Installing..."
    apt-get update -qq
    apt-get install -y unzip curl
    
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    ./aws/install
    rm -rf aws awscliv2.zip
    
    echo "AWS CLI installed successfully"
else
    echo "AWS CLI already installed"
fi

# Verify AWS CLI is working
aws --version || {
    echo "FATAL: AWS CLI installation failed"
    exit 1
}

# ========================================
# Step 2: Clone Repository
# ========================================
cd /home/ubuntu
git clone -b ${process.env.GITHUB_GATEWAY_REPOSITORY_BRANCH} ${
    process.env.GITHUB_GATEWAY_REPOSITORY_URL
  }
cd ${process.env.GITHUB_GATEWAY_REPOSITORY_NAME}

# Ensure running as root
if [ "$EUID" -ne 0 ]; then     
    exec sudo -E bash "$0" "$@"
fi

# ========================================
# Step 3: Set Basic Environment Variables
# ========================================
export SSM_PREFIX="${process.env.SSM_PARAMETER_PREFIX}"
export ADMIN_EMAIL="${session.user?.email || process.env.ADMIN_EMAIL}"
export APP_DOMAIN="${process.env.DOMAIN_NAME}"
export APP_SUBDOMAIN_NAME="${randomGatewaySubDomain}"
export FP_APP_TOKEN_PASS="${token}"
export FP_PROXY_SERVER_OWNER="${session.user.id}"

echo "SSM_PREFIX set to: $SSM_PREFIX"

# ========================================
# Step 4: Function to Fetch SSM Parameters
# ========================================
get_ssm_param() {
  local param_name="$1"
  echo "Fetching SSM parameter: $param_name" >&2
  
  local value=$(aws ssm get-parameter \
    --name "$param_name" \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text \
    --region ${process.env.AWS_REGION || "us-east-1"} 2>&1)
  
  local exit_code=$?
  
  if [ $exit_code -ne 0 ]; then
    echo "ERROR: Failed to fetch $param_name" >&2
    echo "AWS CLI Error: $value" >&2
    return 1
  fi
  
  if [ -z "$value" ] || [ "$value" = "None" ]; then
    echo "ERROR: Empty value for $param_name" >&2
    return 1
  fi
  
  echo "$value"
  return 0
}

# ========================================
# Step 5: Fetch All SSM Parameters
# ========================================
echo "Fetching Cloudflare token..."
export CF_Token=$(get_ssm_param "\${SSM_PREFIX}/cloudflare/token")
if [ $? -ne 0 ] || [ -z "$CF_Token" ]; then
  echo "FATAL: Failed to get CF_Token"
  exit 1
fi
echo "✓ CF_Token fetched (length: \${#CF_Token})"

echo "Fetching Cloudflare Zone ID..."
export CF_Zone_ID=$(get_ssm_param "\${SSM_PREFIX}/cloudflare/zone-id")
if [ $? -ne 0 ] || [ -z "$CF_Zone_ID" ]; then
  echo "FATAL: Failed to get CF_Zone_ID"
  exit 1
fi
echo "✓ CF_Zone_ID fetched (length: \${#CF_Zone_ID})"

echo "Fetching API key..."
export OPENROUTER_KEY=$(get_ssm_param "\${SSM_PREFIX}/openrouter/api-key")
if [ $? -ne 0 ] || [ -z "$OPENROUTER_KEY" ]; then
  echo "FATAL: Failed to get OPENROUTER_KEY"
  exit 1
fi
echo "✓ OPENROUTER_KEY fetched (length: \${#OPENROUTER_KEY})"

echo "All SSM parameters fetched successfully"

# ========================================
# Step 6: Validate Critical Variables
# ========================================
if [[ "$CF_Zone_ID" == *"not found"* ]] || [[ "$CF_Zone_ID" == *"error"* ]]; then
  echo "FATAL: CF_Zone_ID contains error message: $CF_Zone_ID"
  exit 1
fi

if [[ "$CF_Token" == *"not found"* ]] || [[ "$CF_Token" == *"error"* ]]; then
  echo "FATAL: CF_Token contains error message"
  exit 1
fi

# ========================================
# Step 7: Run Deployment Script
# ========================================
chmod +x admin/auto.sh
admin/auto.sh

echo "===============Deployment Success=============="

sleep 300
rm -f /var/log/cloud-init-output.log
rm -f /var/log/cloud-init.log
history -c
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
    IamInstanceProfile: {
      Name: process.env.AWS_IAM_INSTANCE_PROFILE,
    },
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
  const proxyModelsKey = [process.env.PROXY_MODELS_PREFIX, proxyId].join(":");

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
      const [
        modelsDeleteResult,
        subDomainDeleteResult,
        proxyDeleteResult,
        TerminateResponse,
      ] = await Promise.all([
        redis.del(proxyModelsKey),
        redis.del(subdomainInstanceRedisKey),
        redis.del(proxyRedisKey),
        ec2.send(terminateCommand),
      ]);

      terminationSuccess =
        TerminateResponse?.TerminatingInstances?.some(
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

      const cleanupPromises: Promise<unknown>[] = [];
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

export async function deleteAllPrivateProxyInstances(userId: string): Promise<{
  total: number;
  success: number;
  failed: number;
  errors: string[];
}> {
  const result = {
    total: 0,
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  if (userId === undefined || userId === null || userId === "") {
    result.errors.push("Invalid userId");
    return result;
  }

  if (undefined === process.env.PROXY_PRIVATE_PREFIX) {
    result.errors.push("Environment not configured");
    return result;
  }

  try {
    const searchPatternPrefix = `${process.env.PROXY_PRIVATE_PREFIX}:${userId}:`;

    let allKeys: string[] = [];
    let cursor = 0;
    let iterations = 0;
    const MAX_ITERATIONS = 100;

    do {
      if (iterations++ > MAX_ITERATIONS) {
        result.errors.push("SCAN exceeded max iterations");
        break;
      }
      const [newCursor, keys] = await redis.scan(cursor, {
        match: `${searchPatternPrefix}*`,
        count: 100,
      });
      allKeys.push(...keys);
      cursor = Number(newCursor);
    } while (cursor !== 0);

    result.total = allKeys.length;

    if (allKeys.length === 0) {
      console.log(`No private proxies found for user ${userId}`);
      return result;
    }

    console.log(
      `[BATCH DELETE] Found ${allKeys.length} private proxies for user ${userId}`
    );

    const proxyValues: { url: string; status: string }[] = await redis.mget<
      { url: string; status: string }[]
    >(...allKeys);

    const deletePromises: Promise<
      | {
          success: boolean;
          proxyKey: string;
          proxyId: string;
          error: string;
          warning?: undefined;
          instanceId?: undefined;
        }
      | {
          success: boolean;
          proxyKey: string;
          proxyId: string;
          warning: string;
          error?: undefined;
          instanceId?: undefined;
        }
      | {
          success: boolean;
          proxyKey: string;
          proxyId: string;
          instanceId: string;
          error?: undefined;
          warning?: undefined;
        }
    >[] = allKeys.map(async (key, index) => {
      const proxyId = key.replace(searchPatternPrefix, "");
      const proxyInfo = proxyValues[index];

      if (!proxyInfo || !proxyInfo.url) {
        console.error(`Invalid proxy info for key: ${key}`);
        return {
          success: false,
          proxyKey: key,
          proxyId,
          error: "Invalid proxy info",
        };
      }

      let subdomain = proxyInfo.url;
      if (subdomain.startsWith("https://")) {
        subdomain = subdomain.substring(8);
      }
      try {
        const { CLOUDFLARE_ZONE_ID, SUBDOMAIN_INSTANCE_PREFIX } = process.env;

        if (!CLOUDFLARE_ZONE_ID || !SUBDOMAIN_INSTANCE_PREFIX) {
          return {
            success: false,
            proxyKey: key,
            proxyId,
            error: "Environment not configured",
          };
        }

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
        const proxyModelsKey = [process.env.PROXY_MODELS_PREFIX, proxyId].join(
          ":"
        );

        const instanceId = await redis.get<string>(subdomainInstanceRedisKey);

        if (!instanceId) {
          console.warn(
            `[BATCH DELETE] No instance found for subdomain: ${subdomain}, cleaning up Redis keys`
          );

          await Promise.all([
            redis.del(proxyModelsKey),
            redis.del(subdomainInstanceRedisKey),
            redis.del(proxyRedisKey),
          ]);
          return {
            success: true,
            proxyKey: key,
            proxyId,
            warning: "No instance found, Redis cleaned up",
          };
        }

        const terminateCommand = new TerminateInstancesCommand({
          InstanceIds: [instanceId],
        });

        const [
          modelsDeleteResult,
          subDomainDeleteResult,
          proxyDeleteResult,
          TerminateResponse,
        ] = await Promise.all([
          redis.del(proxyModelsKey),
          redis.del(subdomainInstanceRedisKey),
          redis.del(proxyRedisKey),
          ec2.send(terminateCommand).catch((error) => {
            console.error(
              `[BATCH DELETE] EC2 termination failed for ${instanceId}:`,
              error
            );
            return null;
          }),
        ]);

        const terminationSuccess =
          TerminateResponse?.TerminatingInstances?.some(
            (instance) => instance.InstanceId === instanceId
          ) ?? false;

        try {
          const records = await cloudflare.dns.records.list({
            zone_id: CLOUDFLARE_ZONE_ID,
            type: "A",
            name: {
              exact: subdomain,
            },
          });

          if (records.result.length > 0) {
            await Promise.all(
              records.result.map((record) =>
                cloudflare.dns.records
                  .delete(record.id, {
                    zone_id: CLOUDFLARE_ZONE_ID,
                  })
                  .catch((error) => {
                    console.error(
                      `[BATCH DELETE] Failed to delete DNS record ${record.id}:`,
                      error
                    );
                  })
              )
            );
          }
        } catch (dnsError) {
          console.error(
            `[BATCH DELETE] DNS cleanup error for ${subdomain}:`,
            dnsError
          );
        }

        return {
          success: terminationSuccess || !TerminateResponse,
          proxyKey: key,
          proxyId,
          instanceId,
        };
      } catch (error) {
        console.error(`[BATCH DELETE] Error deleting proxy ${proxyId}:`, error);
        return {
          success: false,
          proxyKey: key,
          proxyId,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const results = await Promise.all(deletePromises);
    const successfulKeys: string[] = [];

    results.forEach((res, index) => {
      if (res.success) {
        result.success++;
        successfulKeys.push(allKeys[index]);
      } else {
        result.failed++;
        if (res.error) {
          result.errors.push(`${res.proxyId}: ${res.error}`);
        }
      }
    });

    if (successfulKeys.length > 0) {
      try {
        console.log(
          `[BATCH DELETE] Final cleanup: deleting ${successfulKeys.length} successful keys with prefix ${searchPatternPrefix}`
        );
        await redis.del(...successfulKeys);
      } catch (cleanupError) {
        console.error(
          "[BATCH DELETE] Error during final cleanup:",
          cleanupError
        );
        result.errors.push("Final cleanup failed");
      }
    }

    console.log(
      `[BATCH DELETE] Completed for user ${userId}: ${result.success} success, ${result.failed} failed out of ${result.total}`
    );
    return result;
  } catch (error) {
    console.error("Unexpected error in deleteAllPrivateProxyInstances:", error);
    result.errors.push(
      error instanceof Error ? error.message : "Unknown error"
    );
    return result;
  }
}

export async function fetchConsoleLogs(
  subdomain: string
): Promise<undefined | string> {
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
      return Buffer.from(response.Output, "base64").toString("utf-8");
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
  }
}

export async function fetchDeploymentProgress(
  subdomain: string
): Promise<null | {
  stp: number;
  tot: number;
  sts: string;
  msg: string[];
}> {
  if (process.env.DEPLOYMENT_PROGRESS_PREFIX === undefined) {
    return null;
  }
  try {
    const deploymentStatus: {
      stp: number;
      tot: number;
      sts: string;
      msg: string[];
    } | null = await redis.get<{
      stp: number;
      tot: number;
      sts: string;
      msg: string[];
    }>([process.env.DEPLOYMENT_PROGRESS_PREFIX, subdomain].join(":"));
    if (deploymentStatus !== null) {
      return deploymentStatus;
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
  }
  return null;
}

export async function getPriceDetails(): Promise<{
  id: string;
  amount: string;
  currency: string;
}> {
  try {
    const price = await paddle.prices.get(process.env.PADDLE_PRICE_ID || "");
    return {
      id: process.env.PADDLE_PRICE_ID || "",
      amount: price.unitPrice.amount,
      currency: price.unitPrice.currencyCode,
    };
  } catch (error) {
    console.error("Error fetching product details:", error);
    return {
      id: process.env.PADDLE_PRICE_ID || "",
      amount: "1900",
      currency: "USD",
    };
  }
}

export async function getSubscription(): Promise<{
  isActive: boolean;
  isCanceled: boolean;
  status: string;
  nextBilledAt: string | null;
  canceledAt: string | null;
  currentQuantity: number;
  scheduledChange: any;
} | null> {
  if (process.env.SUBSCRIPTION_KEY_PREFIX === undefined) {
    console.error("getSubscriptionId - SUBSCRIPTION_KEY_PREFIX env not set");
    return null;
  }
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  const userId = session.user.id;
  try {
    const subscriptionId = await redis.get<string>(
      [process.env.SUBSCRIPTION_KEY_PREFIX, userId].join(":")
    );
    if (subscriptionId === null) {
      return null;
    }
    // Pass the subscription id to get
    const subscription: Subscription = await paddle.subscriptions.get(
      subscriptionId
    );

    const currentQuantity = subscription.items[0]?.quantity || 1;

    // Returns a subscription entity with full details
    return {
      isActive: subscription.status === "active",
      isCanceled:
        subscription.canceledAt !== null && subscription.status === "active",
      status: subscription.status,
      nextBilledAt: subscription.nextBilledAt,
      canceledAt: subscription.canceledAt,
      currentQuantity: currentQuantity,
      scheduledChange: subscription.scheduledChange,
    };
  } catch (e) {
    console.error(`Error fetching subscription: `, e);
    return null;
  }
}

export async function cancelSubscription(): Promise<boolean> {
  if (process.env.SUBSCRIPTION_KEY_PREFIX === undefined) {
    console.error("getSubscriptionId - SUBSCRIPTION_KEY_PREFIX env not set");
    return false;
  }
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }
  const userId = session.user.id;
  try {
    const subscriptionId = await redis.get<string>(
      [process.env.SUBSCRIPTION_KEY_PREFIX, userId].join(":")
    );
    if (subscriptionId === null) {
      return false;
    }
    await paddle.subscriptions.cancel(subscriptionId, {
      effectiveFrom: "next_billing_period",
    });
    return true;
  } catch (e) {
    console.error(`Error canceling subscription: `, e);
    return false;
  }
}

export async function reactivateSubscription(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const userId = session.user.id;
  try {
    const subscriptionId = await redis.get<string>(
      [process.env.SUBSCRIPTION_KEY_PREFIX, userId].join(":")
    );

    if (!subscriptionId) return false;
    await paddle.subscriptions.update(subscriptionId, {
      scheduledChange: null,
    });
    return true;
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    return false;
  }
}

export async function updateSubscription(
  instanceCount: number
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const userId = session.user.id;
  try {
    const subscriptionId = await redis.get<string>(
      [process.env.SUBSCRIPTION_KEY_PREFIX, userId].join(":")
    );

    if (!subscriptionId) return false;
    await paddle.subscriptions.update(subscriptionId, {
      items: [
        {
          priceId: process.env.PADDLE_PRICE_ID || "",
          quantity: instanceCount,
        },
      ],
      prorationBillingMode: "full_next_billing_period",
    });
    return true;
  } catch (error) {
    console.error("Error updating subscription:", error);
    return false;
  }
}
