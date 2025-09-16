"use server";

import { auth } from "@/auth";
import { jwtSign } from "./jwt";
import { VERIFY_TOKEN_EXPIRE_SECONDS } from "./utils";
import { redirect } from "next/navigation";
import { encrypt } from "./encryption";

// Get all target providers
export async function getAllTargetProviders(): Promise<
  { id: string; url: string }[]
> {
  const { token, error } = await jwtSign(true, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (!token) {
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
  if (!token) {
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

// Create new adapter
export async function createAdapter(
  api_key: string,
  provider_id: string,
  base_url: string,
  model_id: string,
  note_comment: string
): Promise<boolean> {
  const { token, error } = await jwtSign(true, VERIFY_TOKEN_EXPIRE_SECONDS);
  if (token === undefined) {
    console.error("Error generating auth token:", error);
    return false;
  }
  try {
    const response = await fetch(
      [process.env.BASE_URL, "api/adapters"].join("/"),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider_id,
          base_url,
          model_id,
          note_comment,
        }),
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error creating adapter:", error);
    return false;
  }
}

export async function retrieveAdapterKey(
  oneTimeToken: string
): Promise<undefined | { secure: string }> {
  const user_id: string | undefined = (await auth())?.user?.id;
  if (user_id === undefined) {
    return undefined;
  }
  const { token, error } = await jwtSign(
    { uid: user_id, t: oneTimeToken },
    VERIFY_TOKEN_EXPIRE_SECONDS
  );
  if (!token) {
    console.error("Error generating auth token:", error);
    return undefined;
  }
  try {
    const response = await fetch(
      [process.env.BASE_URL, "api/token"].join("/"),
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
    console.error("Error generating one-time token:", error);
  }
  return undefined;
}

// Send contact message
export async function sendContactMessage(
  subject: string,
  message: string
): Promise<{ message: string; success: boolean }> {
  const { token, error } = await jwtSign(false, VERIFY_TOKEN_EXPIRE_SECONDS);
  try {
    if (!token) {
      console.error("Error generating auth token:", error);
      return { message: "Error generating auth token", success: false };
    }
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

export async function getAPIKeyAction(
  formData: FormData
): Promise<string | undefined> {
  const adapter = formData.get("adapter") as string;
  const adapterJSON: {
    provider_id: string;
    provider_url: string;
    base_url: string;
    model_id: string;
    create_time: string;
  } = JSON.parse(adapter);
  return `/management/modify?baseUrl=${encodeURIComponent(
    adapterJSON.base_url
  )}&modelId=${encodeURIComponent(
    adapterJSON.model_id
  )}&providerId=${encodeURIComponent(
    adapterJSON.provider_id
  )}&createTime=${encodeURIComponent(adapterJSON.create_time)}`;
}

export async function deleteAdapterAction(
  formData: FormData
): Promise<string | undefined> {
  const user_id: string | undefined = (await auth())?.user?.id;
  if (user_id === undefined) {
    return undefined;
  }
  const adapter_id = formData.get("adapterId") as string;
  const { token, error } = await jwtSign(
    { uid: user_id },
    VERIFY_TOKEN_EXPIRE_SECONDS
  );
  if (!token) {
    console.error("Error generating auth token:", error);
    return undefined;
  }
  try {
    const response = await fetch(
      [process.env.BASE_URL, "api/adapters"].join("/"),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          create_time,
        }),
      }
    );
    if (response.ok) {
      return "/management";
    }
  } catch (error) {
    console.error("Error deleting adapter:", error);
  }
  return undefined;
}

export async function updateAdapterAction(
  formData: FormData
): Promise<string | undefined> {
  const user_id: string | undefined = (await auth())?.user?.id;
  if (user_id === undefined) {
    return undefined;
  }
  const apiKey = formData.get("apiKey") as string;
  const baseUrl = formData.get("baseUrl") as string;
  const modelId = formData.get("modelId") as string;
  try {
    const { token: keyToken, error: keyError } = await jwtSign({
      u: user_id,
      a: apiKey,
      b: baseUrl,
      m: modelId,
    });
    if (keyToken === undefined) {
      console.error("Error generating key token: ", keyError);
      return undefined;
    }
    const { token: tempToken, error: tempError } = await jwtSign(
      { uid: user_id, s: keyToken },
      VERIFY_TOKEN_EXPIRE_SECONDS
    );
    if (!tempToken) {
      console.error("Error generating temp token:", tempError);
      return undefined;
    }
    const response = await fetch(
      [process.env.BASE_URL, "api/token"].join("/"),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tempToken}`,
        },
      }
    );
    const oneTimeToken: undefined | { token: string } = await response.json();
    if (oneTimeToken !== undefined) {
      return `/management/key?token=${encodeURIComponent(oneTimeToken.token)}`;
    }
  } catch (error) {
    console.error("Error updating adapter:", error);
  }
  return undefined;
}

export async function createAdapterAction(
  formData: FormData
): Promise<boolean> {
  const pid = formData.get("provider") as string;
  const url = formData.get("baseUrl") as string;
  const mid = formData.get("modelId") as string;
  const apiKey = formData.get("apiKey") as string;
  const commentNote: string | null = formData.get("commentNote") as string;
  const user_id: string | undefined = (await auth())?.user?.id;
  if (user_id === undefined) {
    return false;
  }
  if (!process.env.ENCRYPTION_KEY) {
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
        [process.env.BASE_URL, "api/token"].join("/"),
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
