"use server";

import { auth } from "@/auth";
import { jwtSign } from "./jwt";

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

export async function getAllUserAdapters(
  userId: string
): Promise<{ target: string; token: string; url: string }[]> {
  try {
    const { token, error } = await jwtSign({ user_id: userId }, 3600);
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

export async function createAdapter(data: {
  user_id: string;
  provider_id: string;
  base_url: string;
  api_key: string;
  model_id: string;
}) {
  try {
    const { token, error } = await jwtSign(data, 3600);
    if (!token) {
      console.error("Error generating auth token:", error);
      return [];
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
          api_key,
          model_id,
        }),
      }
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Error fetching adapters:", error);
  }
}
