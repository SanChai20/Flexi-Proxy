import {
  constants,
  createCipheriv,
  createDecipheriv,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
  scryptSync,
} from "crypto";

// 对称加密函数
export function symmetricEncrypt(
  text: string,
  key: string
): { iv: string; encryptedData: string; authTag: string } {
  const derivedKey = Buffer.from(key, "hex");
  if (derivedKey.length !== 32) {
    throw new Error("Key must be 256 bits (32 bytes) for AES-256");
  }

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

export function symmetricDecrypt(
  hash: { iv: string; encryptedData: string; authTag: string },
  key: string
): string {
  const derivedKey = Buffer.from(key, "hex");
  if (derivedKey.length !== 32) {
    throw new Error("Key must be 256 bits (32 bytes) for AES-256");
  }

  const iv = Buffer.from(hash.iv, "hex");
  const encryptedText = Buffer.from(hash.encryptedData, "hex");
  const authTag = Buffer.from(hash.authTag, "hex");

  const decipher = createDecipheriv("aes-256-gcm", derivedKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, undefined, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// 非对称加密函数
export function asymmetricEncrypt(
  text: string,
  publicKey: string
): { encryptedData: string } {
  const buffer = Buffer.from(text, "utf8");
  const encrypted = publicEncrypt(
    {
      key: publicKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buffer
  );

  return {
    encryptedData: encrypted.toString("base64"),
  };
}

export function asymmetricDecrypt(
  encryptedData: string,
  privateKey: string
): string {
  const buffer = Buffer.from(encryptedData, "base64");
  const decrypted = privateDecrypt(
    {
      key: privateKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buffer
  );

  return decrypted.toString("utf8");
}

// export function generateKeyPair(): { publicKey: string; privateKey: string } {
//   const { publicKey, privateKey } = generateKeyPairSync("rsa", {
//     modulusLength: 2048,
//     publicKeyEncoding: {
//       type: "spki",
//       format: "pem",
//     },
//     privateKeyEncoding: {
//       type: "pkcs8",
//       format: "pem",
//     },
//   });

//   return { publicKey, privateKey };
// }
