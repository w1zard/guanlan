import { env } from "cloudflare:workers";

const COOKIE_NAME = "guanlan_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

type AuthEnv = { GUANLAN_PASSWORD?: string; GUANLAN_SESSION_SECRET?: string };

function authEnv() {
  return env as unknown as AuthEnv;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(value: string) {
  const secret = authEnv().GUANLAN_SESSION_SECRET;
  if (!secret) throw new Error("GUANLAN_SESSION_SECRET is not configured");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function readCookie(request: Request) {
  const raw = request.headers.get("cookie") ?? "";
  return raw.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1) ?? null;
}

export function passwordIsConfigured() {
  const runtime = authEnv();
  return Boolean(runtime.GUANLAN_PASSWORD && runtime.GUANLAN_SESSION_SECRET);
}

export async function verifyPassword(password: string) {
  const expected = authEnv().GUANLAN_PASSWORD;
  if (!expected) throw new Error("GUANLAN_PASSWORD is not configured");
  const actualDigest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  const expectedDigest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(expected));
  const actual = new Uint8Array(actualDigest);
  const wanted = new Uint8Array(expectedDigest);
  let difference = 0;
  for (let index = 0; index < wanted.length; index += 1) difference |= actual[index] ^ wanted[index];
  return difference === 0;
}

export async function createSessionCookie(request: Request) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `v1.${expires}`;
  const token = `${payload}.${await sign(payload)}`;
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure}`;
}

export function clearSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export async function hasPasswordSession(request: Request) {
  if (!passwordIsConfigured()) return false;
  const token = readCookie(request);
  if (!token) return false;
  const [version, expiresRaw, signature] = token.split(".");
  if (version !== "v1" || !expiresRaw || !signature || Number(expiresRaw) <= Date.now() / 1000) return false;
  const expected = await sign(`${version}.${expiresRaw}`);
  return signature === expected;
}

export async function requirePasswordSession(request: Request) {
  return await hasPasswordSession(request) ? null : Response.json({ error:"Unauthorized" }, { status:401 });
}
