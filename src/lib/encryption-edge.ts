function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

async function importPublicKey(pem: string): Promise<CryptoKey> {
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = pem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"]
  );
}

// ============ Symmetry ============

export async function symmetricEncrypt(
  text: string,
  key: string
): Promise<{ iv: string; encryptedData: string; authTag: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // 将十六进制密钥转换为 Uint8Array
  const derivedKey = hexToBytes(key);
  if (derivedKey.length !== 32) {
    throw new Error("Key must be 256 bits (32 bytes) for AES-256");
  }

  // 导入密钥
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    derivedKey as Uint8Array<ArrayBuffer>,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  // 生成随机 IV (16 字节，与 Node.js 的 randomBytes(16) 一致)
  const iv = crypto.getRandomValues(new Uint8Array(16));

  // 加密 (tagLength: 128 bits = 16 bytes，与 Node.js GCM 默认一致)
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: 128, // 128 bits = 16 bytes
    },
    cryptoKey,
    data
  );

  // Web Crypto API 的 AES-GCM 加密结果 = 密文 + 认证标签（最后 16 字节）
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const ciphertext = encryptedArray.slice(0, -16); // 密文部分
  const authTag = encryptedArray.slice(-16); // 最后 16 字节是认证标签

  return {
    iv: bytesToHex(iv),
    encryptedData: bytesToHex(ciphertext),
    authTag: bytesToHex(authTag),
  };
}

export async function symmetricDecrypt(
  hash: { iv: string; encryptedData: string; authTag: string },
  key: string
): Promise<string> {
  // 将十六进制转换为 Uint8Array
  const derivedKey = hexToBytes(key);
  if (derivedKey.length !== 32) {
    throw new Error("Key must be 256 bits (32 bytes) for AES-256");
  }

  const iv = hexToBytes(hash.iv);
  const encryptedText = hexToBytes(hash.encryptedData);
  const authTag = hexToBytes(hash.authTag);

  // 导入密钥
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    derivedKey as Uint8Array<ArrayBuffer>,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  // Web Crypto API 需要将密文和认证标签合并
  const combined = new Uint8Array(encryptedText.length + authTag.length);
  combined.set(encryptedText, 0);
  combined.set(authTag, encryptedText.length);

  // 解密
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as Uint8Array<ArrayBuffer>,
      tagLength: 128,
    },
    cryptoKey,
    combined
  );

  // 转换为字符串
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// ============ Asymmetry ============

export async function asymmetricEncrypt(
  text: string,
  publicKey: string
): Promise<{ encryptedData: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const cryptoKey = await importPublicKey(publicKey);
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    cryptoKey,
    data
  );
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const base64 = btoa(String.fromCharCode(...encryptedArray));
  return {
    encryptedData: base64,
  };
}
