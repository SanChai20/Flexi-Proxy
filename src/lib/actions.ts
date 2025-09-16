"use server";

import { jwtSign } from "./jwt";
import { VERIFY_TOKEN_EXPIRE_SECONDS } from "./utils";
import { encrypt } from "./encryption";

// Get all target providers
export async function getAllTargetProviders(): Promise<
  { id: string; url: string }[]
> {
  const { token, error } = await jwtSign(true, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (token === undefined) {
    console.error("Error generating auth token:", error);
    return [];
  }
  try {
    const response = await fetch(
      [process.env.BASE_URL, "api/providers"].join("/"),
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
  const { token, error } = await jwtSign(true, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (token === undefined) {
    console.error("Error generating auth token:", error);
    return [];
  }
  try {
    const response = await fetch(
      [process.env.BASE_URL, "api/adapters"].join("/"),
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
    console.error("Error fetching adapters:", error);
  }
  return [];
}

// Send contact message
export async function sendContactMessage(
  subject: string,
  message: string
): Promise<{ message: string; success: boolean }> {
  const { token, error } = await jwtSign(false, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (token === undefined) {
    console.error("Error generating auth token:", error);
    return { message: "Error generating auth token", success: false };
  }
  try {
    const response = await fetch(
      [process.env.BASE_URL, "api/contact"].join("/"),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, message }),
      }
    );
    return { message: (await response.json()).message, success: response.ok };
  } catch (error) {
    console.error("Error sending contact message:", error);
    return { message: "Error sending contact message", success: false };
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

export async function getPermissionsAction(): Promise<{
  maa: number;
}> {
  const { token, error } = await jwtSign(true, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (token === undefined) {
    console.error("Error generating auth token:", error);
    return {
      maa: 3,
    };
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
      return await response.json();
    }
  } catch (error) {
    console.error("Error getting permissions:", error);
  }
  return { maa: 3 };
}

export async function updatePermissionsAction(
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
        body: JSON.stringify({}),
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error getting permissions:", error);
    return false;
  }
}
