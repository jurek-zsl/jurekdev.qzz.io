import fs from "fs";
import path from "path";
import crypto from "crypto";

const SECRET_FILE = path.join(process.cwd(), "src", "data", ".admin_secret");
const ENV_LOCAL_FILE = path.join(process.cwd(), ".env.local");

export const COOKIE_NAME = "jurekdev_admin_session";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// Global session secret derived from env or generated persistent seed
function getSessionSecret(): string {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  const secretSeedFile = path.join(process.cwd(), "src", "data", ".session_seed");
  try {
    if (fs.existsSync(secretSeedFile)) {
      return fs.readFileSync(secretSeedFile, "utf-8").trim();
    }
    const generated = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(secretSeedFile, generated, "utf-8");
    return generated;
  } catch {
    return "jurekdev-distributed-systems-static-secret-2026";
  }
}

/**
 * Retrieves the currently active admin password.
 * Priority:
 * 1. src/data/.admin_secret (dynamic file)
 * 2. process.env.ADMIN_PASSWORD
 * 3. Default fallback: "jurek2026"
 */
export function getAdminPassword(): string {
  try {
    if (fs.existsSync(SECRET_FILE)) {
      const content = fs.readFileSync(SECRET_FILE, "utf-8").trim();
      if (content.length > 0) return content;
    }
  } catch {
    // fallback
  }

  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length > 0) {
    return process.env.ADMIN_PASSWORD.trim();
  }

  return "jurek2026";
}

/**
 * Validates the provided candidate password against the real admin password
 * using timing-safe constant-time comparison to prevent timing attacks.
 */
export function verifyAdminPassword(candidate: string): boolean {
  if (typeof candidate !== "string" || candidate.length === 0) {
    return false;
  }

  const realPassword = getAdminPassword();
  const candidateTrimmed = candidate.trim();

  // Create SHA-256 hashes of both strings to ensure identical buffer lengths for timingSafeEqual
  const candidateHash = crypto.createHash("sha256").update(candidateTrimmed).digest();
  const realHash = crypto.createHash("sha256").update(realPassword).digest();

  return crypto.timingSafeEqual(candidateHash, realHash);
}

/**
 * Updates the admin password on disk and updates .env.local if present.
 */
export function updateAdminPassword(newPassword: string): boolean {
  const clean = newPassword.trim();
  if (clean.length < 4) {
    throw new Error("Password must be at least 4 characters.");
  }

  try {
    // Write to .admin_secret
    fs.writeFileSync(SECRET_FILE, clean, "utf-8");

    // Also update or write to .env.local
    try {
      let envContent = "";
      if (fs.existsSync(ENV_LOCAL_FILE)) {
        envContent = fs.readFileSync(ENV_LOCAL_FILE, "utf-8");
        if (/ADMIN_PASSWORD=/.test(envContent)) {
          envContent = envContent.replace(/ADMIN_PASSWORD=.*(\r?\n|$)/, `ADMIN_PASSWORD=${clean}$1`);
        } else {
          envContent += `\nADMIN_PASSWORD=${clean}\n`;
        }
      } else {
        envContent = `ADMIN_PASSWORD=${clean}\nSESSION_SECRET=${getSessionSecret()}\n`;
      }
      fs.writeFileSync(ENV_LOCAL_FILE, envContent, "utf-8");
    } catch {
      // ignore env write error if filesystem restricts root
    }

    // Update runtime env variable
    process.env.ADMIN_PASSWORD = clean;
    return true;
  } catch (err) {
    console.error("Failed to update admin password:", err);
    return false;
  }
}

/**
 * Creates an HMAC-signed session token with timestamp:
 * format: `${timestamp}.${signature}`
 */
export function createSessionToken(): string {
  const secret = getSessionSecret();
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac("sha256", secret).update(timestamp).digest("hex");
  return `${timestamp}.${signature}`;
}

/**
 * Verifies that a given session token is cryptographically authentic
 * and within the valid 7-day expiration window.
 */
export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  const now = Date.now();
  const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Check expiration & check if timestamp is too far in future (clock skew tolerance: 2 mins)
  if (now - timestamp > MAX_AGE_MS || timestamp - now > 2 * 60 * 1000) {
    return false;
  }

  const secret = getSessionSecret();
  const expectedSig = crypto.createHmac("sha256", secret).update(timestampStr).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

/**
 * Inspects incoming request headers for the HTTP-only admin session cookie.
 */
export function isAuthenticatedRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return false;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!sessionCookie) return false;

  const token = sessionCookie.substring(`${COOKIE_NAME}=`.length);
  return verifySessionToken(token);
}

// In-memory rate limiting map for login attempts: IP -> timestamps[]
const loginAttempts = new Map<string, number[]>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxAttempts = 6;

  const attempts = loginAttempts.get(ip) || [];
  const validAttempts = attempts.filter((t) => now - t < windowMs);

  if (validAttempts.length >= maxAttempts) {
    loginAttempts.set(ip, validAttempts);
    return false; // Rate limit exceeded
  }

  validAttempts.push(now);
  loginAttempts.set(ip, validAttempts);
  return true;
}
