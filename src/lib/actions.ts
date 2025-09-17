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
  const { token, error } = await jwtSign(true, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (token === undefined) {
    console.error("Error generating auth token:", error);
    return false;
  }
  try {
    const response = await fetch(
      [process.env.BASE_URL, "api/adapters", adapterId].join("/"),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error deleting adapter:", error);
    return false;
  }
}

export async function updateAdapterAction(
  formData: FormData
): Promise<boolean> {
  const pid = formData.get("provider") as string;
  const url = formData.get("baseUrl") as string;
  const mid = formData.get("modelId") as string;
  const apiKey = formData.get("apiKey") as string;
  const adapterId = formData.get("adapterId") as string;
  const commentNote: string | null = formData.get("commentNote") as string;
  if (process.env.ENCRYPTION_KEY === undefined) {
    return false;
  }
  const { token, error } = await jwtSign(true, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (token === undefined) {
    console.error("Error generating auth token:", error);
    return false;
  }
  try {
    const encodedKey: { iv: string; encryptedData: string; authTag: string } =
      encrypt(apiKey, process.env.ENCRYPTION_KEY);
    const response = await fetch(
      [process.env.BASE_URL, "api/adapters", adapterId].join("/"),
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pid,
          url,
          mid,
          not: commentNote !== null ? commentNote : "",
          kiv: encodedKey.iv,
          ken: encodedKey.encryptedData,
          kau: encodedKey.authTag,
        }),
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error updating adapter:", error);
    return false;
  }
}

export async function createAdapterAction(
  formData: FormData
): Promise<boolean> {
  const pid = formData.get("provider") as string;
  const url = formData.get("baseUrl") as string;
  const mid = formData.get("modelId") as string;
  const apiKey = formData.get("apiKey") as string;
  const commentNote: string | null = formData.get("commentNote") as string;
  if (process.env.ENCRYPTION_KEY === undefined) {
    return false;
  }
  const { token, error } = await jwtSign(true, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (token === undefined) {
    console.error("Error generating auth token:", error);
    return false;
  }
  try {
    const encodedKey: { iv: string; encryptedData: string; authTag: string } =
      encrypt(apiKey, process.env.ENCRYPTION_KEY);
    const response = await fetch(
      [process.env.BASE_URL, "api/adapters", crypto.randomUUID()].join("/"),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pid,
          url,
          mid,
          not: commentNote !== null ? commentNote : "",
          kiv: encodedKey.iv,
          ken: encodedKey.encryptedData,
          kau: encodedKey.authTag,
        }),
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error creating adapter:", error);
    return false;
  }
}

export async function getAdapterAction(
  adapterId: string
): Promise<{ url: string; mid: string; pid: string; not: string } | undefined> {
  const { token, error } = await jwtSign(true, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (token === undefined) {
    console.error("Error generating auth token:", error);
    return undefined;
  }
  try {
    const adapterResponse = await fetch(
      [process.env.BASE_URL, "api/adapters", adapterId].join("/"),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (adapterResponse.ok) {
      const adapterInfo: { tk: string; pid: string; pul: string; not: string } =
        await adapterResponse.json();
      const tokenResponse = await fetch(
        [process.env.BASE_URL, "api/adapters/token"].join("/"),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-API-Key": adapterInfo.tk,
          },
        }
      );
      if (tokenResponse.ok) {
        const tokenData: {
          uid: string;
          kiv: string;
          ken: string;
          kau: string;
          url: string;
          mid: string;
        } = await tokenResponse.json();
        return {
          url: tokenData.url,
          mid: tokenData.mid,
          pid: adapterInfo.pid,
          not: adapterInfo.not,
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
  const { token, error } = await jwtSign(true, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (token === undefined) {
    console.error("Error generating auth token:", error);
    return { cd: false };
  }
  try {
    const response = await fetch(
      [process.env.BASE_URL, "api/user/settings"].join("/"),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Error getting settings:", error);
  }
  return { cd: false };
}

export async function updateSettingsAction(
  formData: FormData
): Promise<boolean> {
  const dataCollection = formData.get("dataCollection") === "on";
  const { token, error } = await jwtSign(true, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (token === undefined) {
    console.error("Error generating auth token:", error);
    return false;
  }
  try {
    const response = await fetch(
      [process.env.BASE_URL, "api/user/settings"].join("/"),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cd: dataCollection }),
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error updating settings:", error);
    return false;
  }
}

export async function getMaxAdapterAllowedPermissionsAction(): Promise<number> {
  const { token, error } = await jwtSign(true, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (token === undefined) {
    console.error("Error generating auth token:", error);
    return 1;
  }
  try {
    const response = await fetch(
      [process.env.BASE_URL, "api/user/permissions"].join("/"),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      const result = await response.json();
      return result["maa"];
    }
  } catch (error) {
    console.error("Error getting permissions:", error);
  }
  return 1;
}

export async function updateMaxAdapterAllowedPermissionsAction(
  maxAdaptersAllowed: number
): Promise<boolean> {
  const { token, error } = await jwtSign(true, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (token === undefined) {
    console.error("Error generating auth token:", error);
    return false;
  }
  try {
    const response = await fetch(
      [process.env.BASE_URL, "api/user/permissions"].join("/"),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ maa: maxAdaptersAllowed }),
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error getting permissions:", error);
    return false;
  }
}
