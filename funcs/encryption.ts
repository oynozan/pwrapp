import { createECDH, createCipheriv, randomBytes, createDecipheriv } from "crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";

export default class Encryption {
    // Generate ECDH Key Pair
    static generateECDHKeyPair() {
        const ecdh = createECDH("prime256v1");
        ecdh.generateKeys();

        return {
            privateKey: ecdh.getPrivateKey("base64"),
            publicKey: ecdh.getPublicKey("base64"),
            ecdh,
        };
    }

    // Encrypt a message using AES-256
    static encryptMessage(message: string, sharedSecret: string) {
        const iv = randomBytes(16);
        const cipher = createCipheriv("aes-256-cbc", Buffer.from(sharedSecret, "hex"), iv);

        let encrypted = cipher.update(message, "utf8", "hex");
        encrypted += cipher.final("hex");

        return iv.toString("hex") + ":" + encrypted;
    }

    // Decrypt a message using AES-256
    static decryptMessage(encryptedMessage: string, sharedSecret: string) {
        const [iv, encrypted] = encryptedMessage.split(":");
        const decipher = createDecipheriv("aes-256-cbc", Buffer.from(sharedSecret, "hex"), iv);

        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    }

    /**
     * Generates a JWT token
     * @returns {string} JWT token
     */
    static generateJwt(payload: any, expire: string = "90d", secret: string): string {
        return jwt.sign(payload, secret, {
            expiresIn: expire,
        });
    }

    /**
     * Decodes the JWT token
     * @param {JwtPayload} token JWT token
     */
    static decodeJwt(token: string, secret: string): JwtPayload {
        return jwt.verify(token, secret) as JwtPayload;
    }
}
