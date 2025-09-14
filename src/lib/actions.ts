"use server";

import { auth } from "@/auth";
import { jwtSign } from "./jwt";
import { VERIFY_TOKEN_EXPIRE_SECONDS } from "./utils";
import { redirect } from "next/navigation";

// Get all target providers
export async function getAllTargetProviders(): Promise<
  { id: string; url: string }[]
> {
  const user_id: string | undefined = (await auth())?.user?.id;
  if (user_id === undefined) {
    return [];
  }
  try {
    const { token, error } = await jwtSign({ uid: user_id }, VERIFY_TOKEN_EXPIRE_SECONDS);
    if (!token) {
      console.error("Error generating auth token:", error);
      return [];
    }
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
    provider_id: string;
    provider_url: string;
    base_url: string;
    model_id: string;
    create_time: string;
  }[]
> {
  const user_id: string | undefined = (await auth())?.user?.id;
  if (user_id === undefined) {
    return [];
  }
  try {
    const { token, error } = await jwtSign({ uid: user_id }, VERIFY_TOKEN_EXPIRE_SECONDS);
    if (!token) {
      console.error("Error generating auth token:", error);
      return [];
    }
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
  model_id: string
): Promise<
  | string
  | undefined
> {
  const user_id: string | undefined = (await auth())?.user?.id;
  if (user_id === undefined) {
    return undefined;
  }
  try {
    const { token: verifyToken, error: verifyError } = await jwtSign({ uid: user_id }, VERIFY_TOKEN_EXPIRE_SECONDS);
    if (verifyToken === undefined) {
      console.error("Error generating auth token:", verifyError);
      return undefined;
    }
    const response = await fetch(
      [process.env.BASE_URL, "api/adapters"].join("/"),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${verifyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider_id,
          base_url,
          model_id,
        }),
      }
    );
    if (response.ok) {
      const { token: keyToken, error: keyError } = await jwtSign({
        u: user_id,
        a: api_key,
        b: base_url,
        m: model_id
      });
      if (keyToken === undefined) {
        console.error("Error generating api token:", keyError);
        return undefined;
      }

      const { token: tempToken, error: tempError } = await jwtSign({ uid: user_id, s: keyToken }, VERIFY_TOKEN_EXPIRE_SECONDS);
      if (!tempToken) {
        console.error("Error generating temp token:", tempError);
        return undefined;
      }
      const response = await fetch(
        [process.env.BASE_URL, "api/token"].join("/"),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tempToken}`
          }
        }
      );
      const oneTimeToken: undefined | { token: string } = await response.json();
      return oneTimeToken?.token;
    }
  } catch (error) {
    console.error("Error creating adapter:", error);
  }
  return undefined;
}

// Update adapter
export async function updateAdapter(
  api_key: string,
  base_url: string,
  model_id: string
): Promise<
  | string
  | undefined
> {
  const user_id: string | undefined = (await auth())?.user?.id;
  if (user_id === undefined) {
    return undefined;
  }
  try {
    const { token: keyToken, error: keyError } = await jwtSign({
      u: user_id,
      a: api_key,
      b: base_url,
      m: model_id
    });
    if (keyToken === undefined) {
      console.error("Error generating key token: ", keyError);
      return undefined;
    }

    const { token: tempToken, error: tempError } = await jwtSign({ uid: user_id, s: keyToken }, VERIFY_TOKEN_EXPIRE_SECONDS);
    if (!tempToken) {
      console.error("Error generating temp token:", tempError);
      return undefined;
    }
    const response = await fetch(
      [process.env.BASE_URL, "api/token"].join("/"),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tempToken}`
        }
      }
    );
    const oneTimeToken: undefined | { token: string } = await response.json();
    return oneTimeToken?.token;
  } catch (error) {
    console.error("Error updating adapter:", error);
  }
  return undefined;
}

export async function retrieveAdapterKey(oneTimeToken: string): Promise<undefined | { secure: string }> {
  const user_id: string | undefined = (await auth())?.user?.id;
  if (user_id === undefined) {
    return undefined;
  }
  try {
    const { token, error } = await jwtSign({ uid: user_id, t: oneTimeToken }, VERIFY_TOKEN_EXPIRE_SECONDS);
    if (!token) {
      console.error("Error generating auth token:", error);
      return undefined;
    }
    const response = await fetch(
      [process.env.BASE_URL, "api/token"].join("/"),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
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

// Delete adapter by create_time
export async function deleteAdapter(
  create_time: string
): Promise<{ create_time: string } | undefined> {
  const user_id: string | undefined = (await auth())?.user?.id;
  if (user_id === undefined) {
    return undefined;
  }
  try {
    const { token, error } = await jwtSign({ uid: user_id }, VERIFY_TOKEN_EXPIRE_SECONDS);
    if (!token) {
      console.error("Error generating auth token:", error);
      return undefined;
    }
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
      return await response.json();
    }
  } catch (error) {
    console.error("Error deleting adapter:", error);
  }
  return undefined;
}

// Send contact message
export async function sendContactMessage(subject: string, message: string): Promise<{ message: string, success: boolean }> {
  // make sure not in scope of below try catch
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    return {
      message: "User not authenticated",
      success: false
    }
  }
  try {
    const { token, error } = await jwtSign({
      uid: session.user.id,
      un: session.user.name || "User",
      ue: session.user.email || "Email"
    }, VERIFY_TOKEN_EXPIRE_SECONDS);

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


export async function getAPIKeyAction(prevState: any, formData: FormData): Promise<{ adapter?: string }> {
  const adapter = formData.get("adapter") as string;
  const adapterJSON: {
    provider_id: string;
    provider_url: string;
    base_url: string;
    model_id: string;
    create_time: string;
  } = JSON.parse(adapter);
  redirect(
    `/management/modify?baseUrl=${encodeURIComponent(
      adapterJSON.base_url
    )}&modelId=${encodeURIComponent(
      adapterJSON.model_id
    )}&providerId=${encodeURIComponent(
      adapterJSON.provider_id
    )}&createTime=${encodeURIComponent(
      adapterJSON.create_time
    )}`
  );
}
