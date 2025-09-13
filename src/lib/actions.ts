"use server";

import { auth } from "@/auth";
import { jwtSign } from "./jwt";

// Get all target providers
export async function getAllTargetProviders(): Promise<
  { id: string; url: string }[]
> {
  try {
    const { token, error } = await jwtSign(undefined, 3600);
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
  try {
    // const session = await auth();
    // if (!(session && session.user && session.user.id)) {
    //   return [];
    // }
    const { token, error } = await jwtSign({ user_id: "AAAA" }, 3600);
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
  provider_id: string,
  base_url: string,
  model_id: string
): Promise<
  | {
    provider_id: string;
    provider_url: string;
    base_url: string;
    model_id: string;
    create_time: string;
  }
  | undefined
> {
  try {
    const session = await auth();
    if (!(session && session.user && session.user.id)) {
      return undefined;
    }
    const { token, error } = await jwtSign({ user_id: session.user.id }, 3600);
    if (!token) {
      console.error("Error generating auth token:", error);
      return undefined;
    }
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
        }),
      }
    );
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error("Error creating adapter:", error);
  }
  return undefined;
}

// Delete adapter by create_time
export async function deleteAdapter(
  create_time: string
): Promise<{ create_time: string } | undefined> {
  try {
    const session = await auth();
    if (!(session && session.user && session.user.id)) {
      return undefined;
    }
    const { token, error } = await jwtSign({ user_id: session.user.id }, 3600);
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
      return response.json();
    }
  } catch (error) {
    console.error("Error deleting adapter:", error);
  }
  return undefined;
}

// Send contact message
export async function sendContactMessage(subject: string, message: string): Promise<{ message: string, success: boolean }> {
  try {
    const session = await auth();
    if (!(session && session.user && session.user.id)) {
      return {
        message: "User not authenticated",
        success: false
      }
    }
    const { token, error } = await jwtSign({ user_id: session.user.id, user_name: session.user.name || "User", user_email: session.user.email || "Email" }, 3600);
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