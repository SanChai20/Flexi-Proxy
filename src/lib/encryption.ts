import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

export function encrypt(
  text: string,
  key: string
): { iv: string; encryptedData: string; authTag: string } {
  const derivedKey = Buffer.from(key, "hex");
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", derivedKey, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted,
    authTag: authTag,
  };
}

export function decrypt(
  hash: { iv: string; encryptedData: string; authTag: string },
  key: string
): string {
  const derivedKey = Buffer.from(key, "hex");
  const iv = Buffer.from(hash.iv, "hex");
  const encryptedText = Buffer.from(hash.encryptedData, "hex");
  const authTag = Buffer.from(hash.authTag, "hex");

  const decipher = createDecipheriv("aes-256-gcm", derivedKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, undefined, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
