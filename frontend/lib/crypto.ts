import { JSEncrypt } from "jsencrypt";
import { sha256 } from "js-sha256";

export function encryptPassword(password: string): string {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY!);

  const hashedPassword = sha256(password); // ✅ now works
  const encrypted = encryptor.encrypt(hashedPassword);

  if (!encrypted) {
    throw new Error("Encryption failed");
  }

  return encrypted;
}
