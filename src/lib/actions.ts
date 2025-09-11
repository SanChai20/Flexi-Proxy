"use server";

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
