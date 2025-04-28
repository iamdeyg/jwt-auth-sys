import jwt, { JwtPayload } from "jsonwebtoken";
import { generateKeyPairSync, KeyPairSyncResult } from "crypto";

// Define types for the keys object
interface Keys {
  [key: string]: KeyPairSyncResult;
}

// Function to generate RSA key pair
function generateKeyPair(): KeyPairSyncResult {
  return generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
}

// Store RSA keys
const keys: Keys = {
  key1: generateKeyPair(),
  key2: generateKeyPair(),
};

// Function to sign a token with a specific keyId
function signToken(payload: object, keyId: string): string {
  const privateKey = keys[keyId]?.privateKey;
  if (!privateKey) {
    throw new Error(`Key with id ${keyId} does not exist.`);
  }

  return jwt.sign(payload, privateKey, { algorithm: "RS256", keyid: keyId });
}

// Function to verify a token's validity using the appropriate public key
function verifyToken(token: string): JwtPayload | null {
  const decoded = jwt.decode(token, { complete: true }) as {
    header: { kid: string };
  } | null;
  if (!decoded || !decoded.header || !decoded.header.kid) {
    console.error("Invalid token format or missing key ID.");
    return null;
  }

  const keyId = decoded.header.kid;
  const publicKey = keys[keyId]?.publicKey;

  if (!publicKey) {
    console.error(`Public key for keyId ${keyId} not found.`);
    return null;
  }

  try {
    return jwt.verify(token, publicKey) as JwtPayload;
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
}

// Function to rotate keys by adding a new key
function rotateKeys(): void {
  const newKeyId = `key${Object.keys(keys).length + 1}`;
  keys[newKeyId] = generateKeyPair();
  console.log(`Rotated keys: Added ${newKeyId}`);
}

// Example usage of the functions
const payload = { user: "" };

// Sign and verify a token with the existing keys
const token = signToken(payload, "key1");
console.log("Signed Token:", token);

const verifiedPayload = verifyToken(token);
console.log("Verified Payload:", verifiedPayload);

// Rotate keys and generate a new signed token
rotateKeys();

const newToken = signToken(payload, "key3");
console.log("New Signed Token:", newToken);

// Verify the new token
const newVerifiedPayload = verifyToken(newToken);
console.log("New Verified Payload:", newVerifiedPayload);
